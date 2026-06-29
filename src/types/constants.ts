// ============================================================
// DOKAN — Shared Constants
// ============================================================

import type { OrderStatus, OrderType } from './index';

export type GovernorateKey = 'Capital' | 'Muharraq' | 'Northern' | 'Southern';

export const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  { en: string; ar: string; color: string; bg: string }
> = {
  pending:    { en: 'Pending',        ar: 'في الانتظار',     color: '#7A5210', bg: '#F6E8D3' },
  confirmed:  { en: 'Confirmed',      ar: 'تم التأكيد',      color: '#33493D', bg: '#DCE6E0' },
  preparing:  { en: 'Preparing',      ar: 'يتم التحضير',     color: '#7E3409', bg: '#F6DFC4' },
  ready:      { en: 'Ready',          ar: 'جاهز',           color: '#3D5230', bg: '#E3EBD9' },
  completed:  { en: 'Completed',      ar: 'تم التسليم',      color: '#3D3260', bg: '#E6E1F0' },
  cancelled:  { en: 'Cancelled',      ar: 'ملغى',            color: '#7A2A24', bg: '#F3DCDA' },
};

export const ORDER_TYPE_LABELS: Record<OrderType, { en: string; ar: string }> = {
  table:   { en: 'Table Order',   ar: 'طلب طاولة' },
  car:     { en: 'Car Order',     ar: 'طلب سيارة' },
  manual:  { en: 'Manual Order',  ar: 'طلب يدوي' },
};

export const GOVERNORATES: Record<GovernorateKey, { en: string; ar: string }> = {
  Capital:  { en: 'Capital Governorate',  ar: 'محافظة العاصمة' },
  Muharraq: { en: 'Muharraq Governorate', ar: 'محافظة المحرق' },
  Northern: { en: 'Northern Governorate', ar: 'المحافظة الشمالية' },
  Southern: { en: 'Southern Governorate', ar: 'المحافظة الجنوبية' },
};
