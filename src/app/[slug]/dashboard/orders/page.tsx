'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ShoppingBag, Clock, CheckCircle, ChefHat,
  Car, Hand, ArrowUpDown
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRealtimeOrders } from '@/hooks/useRealtimeOrders';
import { formatBHD, formatRelativeTime } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { OrderWithItems, OrderStatus } from '@/types';
import { ORDER_STATUS_CONFIG } from '@/types/constants';
import { toast } from 'sonner';

// Full status flow: pending → confirmed → preparing → ready → completed
// cancelled can happen at any point

const STATUS_TABS: { key: string; labelAr: string }[] = [
  { key: 'active',     labelAr: 'النشطة' },
  { key: 'pending',    labelAr: 'في الانتظار' },
  { key: 'confirmed',  labelAr: 'مؤكد' },
  { key: 'preparing',  labelAr: 'يتم التحضير' },
  { key: 'ready',      labelAr: 'جاهز' },
  { key: 'completed',  labelAr: 'تم التسليم' },
  { key: 'cancelled',  labelAr: 'ملغى' },
];

// Next status in flow
const NEXT_STATUS: Record<string, OrderStatus | null> = {
  pending: 'confirmed',
  confirmed: 'preparing',
  preparing: 'ready',
  ready: 'completed',
  completed: null,
  cancelled: null,
};

const NEXT_STATUS_LABEL: Record<string, string> = {
  pending: '✓ قبول',
  confirmed: '🍳 بدء التحضير',
  preparing: '🔔 جاهز',
  ready: '✅ تم التسليم',
};
// (No entry for 'completed'/'cancelled' — these are terminal states with no next step.)

function OrderCard({
  order,
  onUpdateStatus,
}: {
  order: OrderWithItems;
  onUpdateStatus: (id: string, status: OrderStatus) => Promise<void>;
}) {
  const [updating, setUpdating] = useState(false);
  const nextStatus = NEXT_STATUS[order.status];
  const nextLabel = NEXT_STATUS_LABEL[order.status];
  const config = ORDER_STATUS_CONFIG[order.status] ?? ORDER_STATUS_CONFIG.pending;

  const handleAdvance = async () => {
    if (!nextStatus) return;
    setUpdating(true);
    await onUpdateStatus(order.id, nextStatus);
    setUpdating(false);
  };

  const handleCancel = async () => {
    if (!confirm('تأكيد إلغاء الطلب؟')) return;
    setUpdating(true);
    await onUpdateStatus(order.id, 'cancelled');
    setUpdating(false);
  };

  const isNew = Date.now() - new Date(order.created_at).getTime() < 60000;

  return (
    <div className={cn(
      'card space-y-3 relative animate-slide-up border',
      order.status === 'pending' && 'border-brand-500/30',
      order.status === 'cancelled' && 'opacity-60 border-destructive/20',
    )}>
      {isNew && order.status === 'pending' && (
        <span className="absolute top-3 end-3 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
        </span>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-brand-400 text-lg">{order.order_number}</span>
            {order.order_type === 'car' && <Car size={14} className="text-muted-foreground" />}
            {order.order_type === 'manual' && <Hand size={14} className="text-muted-foreground" />}
            {order.table && (
              <span className="text-xs text-muted-foreground bg-card px-2 py-0.5 rounded-full">
                {order.table.name_ar}
              </span>
            )}
            {order.car_number && (
              <span className="text-xs text-brand-400 bg-primary/10 px-2 py-0.5 rounded-full">
                🚗 {order.car_number}
              </span>
            )}
          </div>
          {order.customer_name && (
            <div className="text-sm text-muted-foreground mt-0.5">{order.customer_name}</div>
          )}
          <div className="text-xs text-muted-foreground mt-0.5">
            {formatRelativeTime(order.created_at, 'ar')}
          </div>
        </div>
        <span className="badge" style={{ background: config.bg, color: config.color, border: `1px solid ${config.color}33` }}>
          {config.ar}
        </span>
      </div>

      {/* Items */}
      <div className="divider pt-1">
        <div className="space-y-1.5 pt-3">
          {(order.order_items ?? []).map(item => (
            <div key={item.id} className="flex items-start justify-between gap-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-brand-400 font-medium flex-shrink-0">×{item.quantity}</span>
                <div>
                  <span className="text-foreground">{item.item_name_ar}</span>
                  {item.variation_name_en && (
                    <span className="text-muted-foreground text-xs"> ({item.variation_name_ar})</span>
                  )}
                  {item.addons?.length > 0 && (
                    <div className="text-xs text-muted-foreground">+ {item.addons.map(a => a.name_ar).join(', ')}</div>
                  )}
                  {item.notes && <div className="text-xs text-warning italic">{'\u201C'}{item.notes}{'\u201D'}</div>}
                </div>
              </div>
              <span className="text-muted-foreground text-xs flex-shrink-0">{formatBHD(item.line_total, 'ar')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="text-xs text-warning bg-warning/10 border border-warning/30 rounded-lg px-3 py-2">
          📝 {order.notes}
        </div>
      )}

      {/* Footer with actions */}
      <div className="flex items-center justify-between pt-1 gap-2">
        <div className="font-bold text-foreground flex-shrink-0">
          {formatBHD(order.total, 'ar')}
        </div>
        <div className="flex gap-2">
          {order.status !== 'completed' && order.status !== 'cancelled' && (
            <button onClick={handleCancel} disabled={updating}
              className="text-xs text-destructive active:text-destructive px-3 min-h-[40px] rounded-lg active:bg-destructive/10 transition-colors touch-manipulation">
              إلغاء
            </button>
          )}
          {nextStatus && nextLabel && (
            <button onClick={handleAdvance} disabled={updating}
              className="btn-primary text-xs min-h-[40px] py-0 px-4">
              {updating ? '...' : nextLabel}
            </button>
          )}
          {order.status === 'completed' && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <CheckCircle size={12} /> مكتمل
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const supabase = createClient();
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('active');
  const [allOrders, setAllOrders] = useState<OrderWithItems[]>([]);
  const [loadingAll, setLoadingAll] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: r } = await supabase.from('restaurants').select('id').eq('owner_id', user.id).single();
      if (r) setRestaurantId(r.id);
    };
    load();
  }, [supabase]);

  const { orders: activeOrders, loading, updateStatus } = useRealtimeOrders(restaurantId ?? '');

  const loadCompleted = useCallback(async () => {
    if (!restaurantId) return;
    setLoadingAll(true);
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('orders')
      .select('*, table:tables(*), order_items(*)')
      .eq('restaurant_id', restaurantId)
      .in('status', ['completed', 'cancelled'])
      .gte('created_at', `${today}T00:00:00`)
      .order('created_at', { ascending: false })
      .limit(50);
    setAllOrders((data as OrderWithItems[]) ?? []);
    setLoadingAll(false);
  }, [restaurantId, supabase]);

  useEffect(() => {
    if (['completed', 'cancelled'].includes(activeTab)) loadCompleted();
  }, [activeTab, loadCompleted]);

  const handleUpdateStatus = async (id: string, status: OrderStatus) => {
    const ok = await updateStatus(id, status);
    if (ok) {
      const labels: Record<string, string> = {
        confirmed: 'تم تأكيد الطلب',
        preparing: 'بدأ التحضير',
        ready: 'الطلب جاهز',
        completed: 'تم تسليم الطلب',
        cancelled: 'تم إلغاء الطلب',
      };
      toast.success(labels[status] ?? 'تم التحديث');
    } else {
      toast.error('حدث خطأ');
    }
  };

  const displayOrders = (() => {
    if (activeTab === 'active') return activeOrders.filter(o => !['completed', 'cancelled'].includes(o.status));
    if (['completed', 'cancelled'].includes(activeTab)) return allOrders;
    return activeOrders.filter(o => o.status === activeTab);
  })();

  if (!restaurantId || loading) {
    return <div className="p-6 flex items-center justify-center h-64"><div className="text-muted-foreground">جار التحميل...</div></div>;
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-bold text-foreground">الطلبات</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">تحديث تلقائي في الوقت الفعلي</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-success opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
          </span>
          <span className="text-xs text-success">مباشر</span>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
        {STATUS_TABS.map(tab => {
          const count = tab.key === 'active'
            ? activeOrders.filter(o => !['completed', 'cancelled'].includes(o.status)).length
            : ['completed', 'cancelled'].includes(tab.key)
            ? undefined
            : activeOrders.filter(o => o.status === tab.key).length;

          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={cn('flex items-center gap-1.5 px-3.5 min-h-[40px] rounded-xl text-sm font-medium flex-shrink-0 transition-all touch-manipulation select-none',
                activeTab === tab.key ? 'bg-primary text-background' : 'text-muted-foreground active:bg-card'
              )}>
              {tab.labelAr}
              {count !== undefined && count > 0 && (
                <span className={cn('text-xs px-1.5 py-0.5 rounded-full font-bold',
                  activeTab === tab.key ? 'bg-background/20 text-background' : 'bg-muted text-foreground'
                )}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Orders */}
      {displayOrders.length === 0 ? (
        <div className="card text-center py-16">
          <ShoppingBag size={40} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">لا توجد طلبات</p>
          <p className="text-sm text-muted-foreground mt-1">
            {activeTab === 'active' ? 'ستظهر الطلبات الجديدة هنا تلقائياً' : 'لا توجد طلبات في هذا القسم'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {displayOrders.map(order => (
            <OrderCard key={order.id} order={order} onUpdateStatus={handleUpdateStatus} />
          ))}
        </div>
      )}

      {loadingAll && <div className="text-center py-8 text-muted-foreground">جار التحميل...</div>}
    </div>
  );
}
