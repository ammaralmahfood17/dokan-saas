import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

const GENERIC_ERROR = { error: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.' };

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const staff_id: string | undefined = body?.staff_id;
    const restaurant_id: string | undefined = body?.restaurant_id;

    if (!staff_id || !restaurant_id) {
      return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 });
    }

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
      console.error('[team/remove] restaurant lookup failed:', restaurantError);
      return NextResponse.json(GENERIC_ERROR, { status: 500 });
    }

    if (restaurant.owner_id !== user.id) {
      return NextResponse.json({ error: 'فقط مالك المطعم يمكنه إزالة الموظفين' }, { status: 403 });
    }

    const { error: deleteError } = await supabase
      .from('restaurant_staff')
      .delete()
      .eq('id', staff_id)
      .eq('restaurant_id', restaurant_id);

    if (deleteError) {
      console.error('[team/remove] delete failed:', deleteError);
      return NextResponse.json(GENERIC_ERROR, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[team/remove] unhandled error:', err);
    return NextResponse.json(GENERIC_ERROR, { status: 500 });
  }
}
