import { createClient, createAdminClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

const GENERIC_ERROR = { error: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.' };

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const restaurant_id: string | undefined = body?.restaurant_id;
    const email: string | undefined = body?.email;
    const role: string | undefined = body?.role;

    if (!restaurant_id || !email || typeof email !== 'string') {
      return NextResponse.json({ error: 'البريد الإلكتروني مطلوب' }, { status: 400 });
    }

    if (role !== 'manager' && role !== 'staff') {
      return NextResponse.json({ error: 'الدور غير صالح' }, { status: 400 });
    }

    // ── 1. Verify the caller is authenticated and owns this restaurant ──
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('id, owner_id')
      .eq('id', restaurant_id)
      .single();

    if (restaurantError || !restaurant) {
      console.error('[team/invite] restaurant lookup failed:', restaurantError);
      return NextResponse.json(GENERIC_ERROR, { status: 500 });
    }

    if (restaurant.owner_id !== user.id) {
      // Not the owner — never let a non-owner add staff, regardless of what
      // restaurant_id they pass in.
      return NextResponse.json({ error: 'فقط مالك المطعم يمكنه دعوة الموظفين' }, { status: 403 });
    }

    // ── 2. Resolve the invitee's real user_id from their email ──
    // This requires the service-role key (the client can never call
    // auth.admin.listUsers() directly), which is why this must happen here
    // and not in the browser.
    const adminClient = createAdminClient();
    const { data: usersPage, error: listError } = await adminClient.auth.admin.listUsers();

    if (listError) {
      console.error('[team/invite] listUsers failed:', listError);
      return NextResponse.json(GENERIC_ERROR, { status: 500 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const invitee = usersPage.users.find(
      (u: { id: string; email?: string }) => u.email?.toLowerCase() === normalizedEmail
    );

    if (!invitee) {
      return NextResponse.json(
        { error: 'لا يوجد مستخدم مسجل بهذا البريد الإلكتروني. يجب أن ينشئ حساباً أولاً.' },
        { status: 404 }
      );
    }

    if (invitee.id === user.id) {
      return NextResponse.json({ error: 'لا يمكنك دعوة نفسك' }, { status: 400 });
    }

    // ── 3. Insert using the INVITEE's user_id — never the caller's ──
    const { data: staffRow, error: insertError } = await supabase
      .from('restaurant_staff')
      .insert({
        restaurant_id,
        user_id: invitee.id,
        role,
        invited_email: normalizedEmail,
      })
      .select()
      .single();

    if (insertError) {
      console.error('[team/invite] insert failed:', insertError);

      if (insertError.code === '23505') {
        // unique(restaurant_id, user_id) violation
        return NextResponse.json({ error: 'هذا المستخدم موظف بالفعل في هذا المطعم' }, { status: 409 });
      }

      return NextResponse.json(GENERIC_ERROR, { status: 500 });
    }

    return NextResponse.json({ success: true, staff: staffRow });
  } catch (err) {
    console.error('[team/invite] unhandled error:', err);
    return NextResponse.json(GENERIC_ERROR, { status: 500 });
  }
}
