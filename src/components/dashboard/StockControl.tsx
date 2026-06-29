'use client';

import { useState } from 'react';
import { Package, AlertCircle, RotateCcw } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import type { Item } from '@/types';

interface Props {
  item: Item & { stock_enabled?: boolean; stock_count?: number | null; sold_out?: boolean };
  onUpdate: () => void;
}

export function StockControl({ item, onUpdate }: Props) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const toggleSoldOut = async () => {
    const next = !item.sold_out;
    setLoading(true);
    const { error } = await supabase
      .from('items')
      .update({ sold_out: next, is_available: !next })
      .eq('id', item.id);

    if (error) {
      toast.error('حدث خطأ');
    } else {
      toast.success(next ? 'تم تحديد العنصر كنافذ المخزون' : 'تم إعادة تفعيل العنصر');
      onUpdate();
    }
    setLoading(false);
  };

  const updateStock = async (count: number) => {
    setLoading(true);
    const { error } = await supabase
      .from('items')
      .update({ stock_count: count, stock_enabled: true })
      .eq('id', item.id);

    if (error) {
      toast.error('حدث خطأ');
    } else {
      toast.success('تم تحديث المخزون');
      onUpdate();
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-2">
      {item.sold_out && (
        <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full font-medium">
          نافذ المخزون
        </span>
      )}
      {item.stock_enabled && item.stock_count != null && !item.sold_out && (
        <span className={cn(
          'text-xs px-2 py-0.5 rounded-full font-medium',
          item.stock_count <= 0 ? 'bg-destructive/10 text-destructive' :
          item.stock_count <= 5 ? 'bg-warning/10 text-warning' :
          'bg-success/10 text-success'
        )}>
          {item.stock_count === 0 ? 'نفذ' : `${item.stock_count} متبقي`}
        </span>
      )}
      <button
        onClick={toggleSoldOut}
        disabled={loading}
        className={cn(
          'text-xs px-2 py-1 rounded-lg transition-colors touch-manipulation',
          item.sold_out
            ? 'bg-success/15 text-success hover:bg-success/20'
            : 'bg-destructive/15 text-destructive hover:bg-destructive/20'
        )}
      >
        {item.sold_out ? 'إعادة تفعيل' : 'نفذ المخزون'}
      </button>
    </div>
  );
}

// ── Quick "sold out" toggle for the kitchen display ──
export function KitchenStockToggle({
  itemNameAr,
  itemId,
}: {
  itemNameAr: string;
  itemId: string | null;
}) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!itemId) return null;

  const markSoldOut = async () => {
    setLoading(true);
    await supabase
      .from('items')
      .update({ sold_out: true, is_available: false })
      .eq('id', itemId);
    setLoading(false);
    setConfirmOpen(false);
    toast.success('تم تحديد العنصر كنافذ المخزون');
  };

  return (
    <>
      <button
        onClick={() => setConfirmOpen(true)}
        disabled={loading}
        className="text-xs text-destructive hover:text-destructive bg-destructive/10 hover:bg-destructive/20
                   px-2 py-1 rounded-lg transition-all touch-manipulation"
      >
        {loading ? '...' : 'نفذ المخزون'}
      </button>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`تحديد "${itemNameAr}" كنافذ المخزون؟`}
        confirmText="تأكيد"
        variant="destructive"
        loading={loading}
        onConfirm={markSoldOut}
      />
    </>
  );
}
