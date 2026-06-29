'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

interface Props {
  subscriptionId: string;
  restaurantId: string;
  currentStatus: string;
}

/**
 * Quick inline actions for admin subscription rows.
 * Mark a subscription as paid (+1 month) in one click.
 */
export function AdminQuickActions({ subscriptionId, restaurantId, currentStatus }: Props) {
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const supabase = createClient();

  const handleConfirm = async () => {
    setSaving(true);
    try {
      // Get current end date
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('current_period_end')
        .eq('id', subscriptionId)
        .single();

      const currentEnd = sub?.current_period_end
        ? new Date(sub.current_period_end)
        : new Date();

      // If already expired, start from now
      if (currentEnd < new Date()) currentEnd.setTime(Date.now());

      const newEnd = new Date(currentEnd);
      newEnd.setMonth(newEnd.getMonth() + 1);

      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          current_period_end: newEnd.toISOString(),
        })
        .eq('id', subscriptionId);

      if (error) {
        console.error('[AdminQuickActions] markPaid subscription update error:', error);
        toast.error('خطأ في تحديث الاشتراك');
      } else {
        // Also update restaurant subscription_status
        const { error: restaurantError } = await supabase
          .from('restaurants')
          .update({ subscription_status: 'active' })
          .eq('id', restaurantId);

        if (restaurantError) {
          console.error('[AdminQuickActions] markPaid restaurant update error:', restaurantError);
        }

        toast.success('✅ تم تسديد الاشتراك وتمديده لشهر');
        window.location.reload();
      }
    } catch (err) {
      console.error('[AdminQuickActions] markPaid unexpected error:', err);
      toast.error('حدث خطأ غير متوقع');
    } finally {
      setSaving(false);
      setDialogOpen(false);
    }
  };

  // Only show for non-active subscriptions (expired, past_due, cancelled)
  if (currentStatus === 'active' || currentStatus === 'free') return null;

  return (
    <>
      <button
        onClick={() => setDialogOpen(true)}
        disabled={saving}
        className="inline-flex items-center gap-1 text-xs font-semibold
                   bg-success/10 border border-success/30 text-success
                   hover:bg-success/20 hover:text-success
                   px-2.5 py-1.5 rounded-lg transition-all touch-manipulation
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <CheckCircle size={12} />
        {saving ? '...' : 'تسديد + شهر'}
      </button>

      <ConfirmDialog
        open={dialogOpen}
        onOpenChange={(o) => { if (!saving) setDialogOpen(o); }}
        title="تأكيد تسديد الاشتراك"
        description="سيتم تمديد الاشتراك شهراً كاملاً من تاريخ انتهائه الحالي وتفعيله فوراً."
        confirmLabel="تسديد + تمديد شهر"
        loading={saving}
        onConfirm={handleConfirm}
      />
    </>
  );
}
