'use client';

import { useState } from 'react';
import { PauseCircle, PlayCircle, AlertTriangle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

interface Props {
  restaurantId: string;
  isPaused: boolean;
  pauseReasonEn?: string | null;
  pauseReasonAr?: string | null;
  onUpdate: () => void;
}

export function PauseOrderingControl({
  restaurantId,
  isPaused,
  pauseReasonEn,
  pauseReasonAr,
  onUpdate,
}: Props) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [reasonEn, setReasonEn] = useState(pauseReasonEn ?? '');
  const [reasonAr, setReasonAr] = useState(pauseReasonAr ?? '');

  const handlePause = async () => {
    setShowReasonModal(true);
  };

  const confirmPause = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('restaurants')
      .update({
        ordering_paused: true,
        pause_reason_en: reasonEn || 'Orders temporarily paused',
        pause_reason_ar: reasonAr || 'الطلبات متوقفة مؤقتاً',
      })
      .eq('id', restaurantId);

    if (!error) {
      toast.success('تم إيقاف الطلبات مؤقتاً');
      setShowReasonModal(false);
      onUpdate();
    }
    setLoading(false);
  };

  const handleResume = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('restaurants')
      .update({
        ordering_paused: false,
        pause_reason_en: null,
        pause_reason_ar: null,
      })
      .eq('id', restaurantId);

    if (!error) {
      toast.success('تم استئناف الطلبات');
      onUpdate();
    }
    setLoading(false);
  };

  return (
    <>
      {/* Pause/Resume button */}
      {isPaused ? (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-warning/10 border border-warning/40
                          rounded-xl px-3 py-2 text-sm text-warning">
            <PauseCircle size={16} className="animate-pulse" />
            الطلبات موقوفة
          </div>
          <Button
            onClick={handleResume}
            disabled={loading}
            variant="outline"
            className="border-success/40 text-success hover:bg-success/10 hover:text-success"
          >
            <PlayCircle size={16} />
            استئناف
          </Button>
        </div>
      ) : (
        <Button
          onClick={handlePause}
          disabled={loading}
          variant="outline"
          className="border-warning/30 text-warning hover:bg-warning/15"
        >
          <PauseCircle size={16} />
          إيقاف الطلبات مؤقتاً
        </Button>
      )}

      {/* Reason modal */}
      {showReasonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowReasonModal(false)}
          />
          <Card className="relative w-full max-w-sm shadow-2xl animate-slide-up">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle size={20} className="text-warning" />
                <h2 className="font-bold text-foreground">
                  سبب الإيقاف
                </h2>
              </div>

              <p className="text-xs text-muted-foreground mb-4">
                سيظهر هذا للعملاء عند محاولة الطلب
              </p>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>السبب (عربي)</Label>
                  <Input
                    dir="rtl"
                    value={reasonAr}
                    onChange={e => setReasonAr(e.target.value)}
                    placeholder="المطبخ مشغول مؤقتاً، شكراً لصبركم"
                    className="font-cairo"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>السبب (إنجليزي)</Label>
                  <Input
                    value={reasonEn}
                    onChange={e => setReasonEn(e.target.value)}
                    placeholder="Kitchen is busy, please try again shortly"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setShowReasonModal(false)}
                >
                  إلغاء
                </Button>
                <Button
                  onClick={confirmPause}
                  disabled={loading}
                  className="flex-1 bg-warning/20 hover:bg-warning/30 text-warning border border-warning/40"
                >
                  {loading ? '...' : 'إيقاف الطلبات'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

// ── Customer-facing pause banner ───────────────────────────
export function PausedBanner({
  reasonEn,
  reasonAr,
}: {
  reasonEn?: string | null;
  reasonAr?: string | null;
}) {
  const reason = reasonAr || reasonEn;

  return (
    <div className="mx-4 mb-4 bg-warning/10 border border-warning/40
                    rounded-2xl p-4 flex items-start gap-3">
      <PauseCircle size={20} className="text-warning flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-semibold text-warning">
          الطلبات متوقفة مؤقتاً
        </p>
        {reason && (
          <p className="text-xs text-warning mt-0.5">{reason}</p>
        )}
        <p className="text-xs text-warning/80 mt-1">
          يرجى المحاولة مرة أخرى قريباً
        </p>
      </div>
    </div>
  );
}
