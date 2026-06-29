'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { OrderWithItems, OrderStatus } from '@/types';

// Statuses that are no longer "active" — remove from kitchen / orders view
const TERMINAL_STATUSES: OrderStatus[] = ['completed', 'cancelled'];

export function useRealtimeOrders(restaurantId: string) {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchOrders = useCallback(async () => {
    if (!restaurantId) return;
    // PostgREST `not … in` filter expects the format: (val1,val2)
    const { data, error } = await supabase
      .from('orders')
      .select(`*, table:tables(*), order_items(*)`)
      .eq('restaurant_id', restaurantId)
      .not('status', 'in', '(completed,cancelled)')
      .order('created_at', { ascending: true });

    if (!error && data) setOrders(data as OrderWithItems[]);
    setLoading(false);
  }, [restaurantId, supabase]);

  useEffect(() => {
    if (!restaurantId) return;
    fetchOrders();

    const channel = supabase
      .channel(`orders-${restaurantId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'orders',
        filter: `restaurant_id=eq.${restaurantId}`,
      }, async (payload) => {
        if (payload.eventType === 'INSERT') {
          const { data } = await supabase
            .from('orders')
            .select(`*, table:tables(*), order_items(*)`)
            .eq('id', payload.new.id)
            .single();
          if (data) setOrders((prev) => [...prev, data as OrderWithItems]);

        } else if (payload.eventType === 'UPDATE') {
          const updated = payload.new as OrderWithItems;

          // Bug fix: remove the order from local state when it reaches a
          // terminal status (completed / cancelled) so it disappears from
          // the kitchen kanban and orders list immediately.
          if (TERMINAL_STATUSES.includes(updated.status as OrderStatus)) {
            setOrders((prev) => prev.filter((o) => o.id !== updated.id));
          } else {
            setOrders((prev) =>
              prev.map((o) => o.id === updated.id ? { ...o, ...updated } : o)
            );
          }

        } else if (payload.eventType === 'DELETE') {
          setOrders((prev) => prev.filter((o) => o.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [restaurantId, fetchOrders, supabase]);

  // Update status + trigger push notification
  const updateStatus = async (orderId: string, status: OrderStatus, locale = 'ar') => {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (!error) {
      // Optimistically remove terminal orders from local state right away
      // (the realtime UPDATE event will confirm this, but this makes the UI
      // feel instant on slow connections).
      if (TERMINAL_STATUSES.includes(status)) {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
      }

      // Fire push notification async (non-blocking)
      fetch('/api/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status, locale }),
      }).catch(() => {/* silent fail */});
    }

    return !error;
  };

  return { orders, loading, updateStatus, refetch: fetchOrders };
}

export function useOrderStatus(orderId: string) {
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!orderId) return;
    const fetchOrder = async () => {
      const { data } = await supabase
        .from('orders')
        .select(`*, table:tables(*), order_items(*)`)
        .eq('id', orderId)
        .single();
      if (data) setOrder(data as OrderWithItems);
      setLoading(false);
    };
    fetchOrder();

    const channel = supabase
      .channel(`order-${orderId}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'orders',
        filter: `id=eq.${orderId}`,
      }, (payload) => {
        setOrder((prev) => prev ? { ...prev, ...(payload.new as OrderWithItems) } : null);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [orderId, supabase]);

  return { order, loading };
}
