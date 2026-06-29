import type { CSSProperties } from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  QrCode, Zap, CreditCard, Globe, BarChart3,
  ChevronRight, Check, Star, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'دكان — نظام طلبات QR للمطاعم في البحرين',
  description: 'دع العملاء يمسحون رمز QR ويطلبون من هواتفهم. الدفع عند الكاشير.',
};

function FeatureCard({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
}) {
  return (
    <Card className="group hover:border-primary/40 transition-all duration-300 bg-card border-border">
      <CardContent className="p-6">
        <div className="w-10 h-10 rounded-full bg-primary/10 border-2 border-primary/20
                        flex items-center justify-center mb-4
                        group-hover:bg-primary/20 group-hover:border-primary/40 transition-colors">
          <Icon size={20} className="text-primary" />
        </div>
        <h3 className="font-bold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
      </CardContent>
    </Card>
  );
}

function StepCard({
  number,
  title,
  desc,
}: {
  number: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary
                      flex items-center justify-center
                      text-primary-foreground ticket-number text-sm">
        {number}
      </div>
      <div>
        <h3 className="font-bold text-foreground mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const features = [
    { icon: QrCode,    title: 'امسح واطلب', desc: 'يمسح العملاء رمز QR على الطاولة ويطلبون مباشرة من هواتفهم. بدون تحميل تطبيق.' },
    { icon: Zap,       title: 'مطبخ في الوقت الفعلي', desc: 'تظهر الطلبات فوراً على شاشة المطبخ. حدّث الحالة وأخبر العملاء عند جاهزية طلبهم.' },
    { icon: CreditCard,title: 'الدفع عند الكاشير', desc: 'لا حاجة لبوابة دفع إلكتروني. يدفع العملاء مباشرة عند الكاونتر نقداً أو ببطاقة.' },
    { icon: Globe,     title: 'عربي أولاً', desc: 'مصمم للبحرين مع دعم كامل للغة العربية وتخطيط RTL وعملة البحرين (د.ب.).' },
    { icon: QrCode,    title: 'توليد رموز QR', desc: 'أنشئ واطبع رموز QR لكل طاولة في ثوانٍ.' },
    { icon: BarChart3, title: 'التحليلات', desc: 'تتبع الإيرادات والعناصر الأكثر طلباً وساعات الذروة بلوحة تحكم في الوقت الفعلي.' },
  ];

  const steps = [
    { title: 'أنشئ قائمتك', desc: 'أضف الأصناف والعناصر والصور والأسعار بالعربي والإنجليزي.' },
    { title: 'اطبع رموز QR', desc: 'أنشئ رموز QR فريدة لكل طاولة واطبعها.' },
    { title: 'العملاء يطلبون', desc: 'يمسحون ويتصفحون ويقدمون طلباتهم من هواتفهم.' },
    { title: 'تحضّر وتستلم', desc: 'تظهر الطلبات على شاشة المطبخ. يدفع العملاء عند الكاشير.' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="border-b border-border sticky top-0 z-50 backdrop-blur-md bg-background/90">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="brand-icon !size-8 !rounded-lg">
              <QrCode size={16} className="text-white" />
            </div>
            <span className="font-bold text-foreground text-lg">
              دكان
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/#features"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              المميزات
            </Link>
            <Link href="/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              تسجيل الدخول
            </Link>
            <Button asChild size="sm">
              <Link href="/register">
                ابدأ الآن
              </Link>
            </Button>
          </nav>

          {/* Mobile nav */}
          <div className="flex md:hidden items-center gap-2">
            <Link href="/login"
              className="text-sm text-muted-foreground hover:text-foreground">
              تسجيل الدخول
            </Link>
            <Button asChild size="sm">
              <Link href="/register">
                ابدأ الآن
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-20 pb-24 text-center">
        {/* Bahrain badge — styled like a stamped ticket tag */}
        <div className="inline-flex items-center gap-2 bg-card border-2 border-primary/20 rounded-full px-4 py-1.5 text-sm font-bold text-primary mb-8 ticket-number">
          <span>🇧🇭</span>
          <span>BH · دكان</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-foreground leading-tight
                       max-w-4xl mx-auto mb-6">
          من مسح الرمز{' '}
          <span className="text-primary">لتسليم الطلب</span>
          {' '}— بلا خطوة وسط
        </h1>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          العميل يمسح، يطلب، ويدفع عند الكاشير. وأنت تشوف طلبه يطلع بشاشة المطبخ فوراً — بدون ورقة ضايعة وبدون انتظار على الطاولة.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/register">
              ابدأ مجاناً
              <ArrowRight size={18} className="rtl:rotate-180" />
            </Link>
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mt-4">لا يلزم وجود بطاقة ائتمانية</p>

        {/* Hero visual — the kitchen ticket rail, our signature element */}
        <div className="mt-16 relative">
          <div className="absolute inset-0 bg-primary/5 rounded-3xl blur-3xl" />
          <div className="relative bg-sidebar rounded-3xl p-6 md:p-8 max-w-3xl mx-auto overflow-hidden">
            <div className="flex items-center justify-between mb-5 px-1">
              <span className="text-sidebar-foreground/60 text-xs font-bold uppercase tracking-widest">
                شاشة المطبخ — الآن
              </span>
              <span className="flex items-center gap-1.5 text-xs font-bold text-[#9FC086]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#9FC086] animate-pulse" />
                مباشر
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 text-left">
              {[
                { num: 'D-001', state: 'يتم التحضير', table: '1', cls: 'border-[#E4A05C] bg-[#FBF1E7]' },
                { num: 'D-002', state: 'جاهز للتسليم', table: '2', cls: 'border-[#9FC086] bg-[#E3EBD9]' },
                { num: 'D-003', state: 'بالانتظار', table: '3', cls: 'border-border bg-card' },
              ].map((o) => (
                <div key={o.num} className={`ticket-edge rounded-t-xl pt-3 px-3 pb-5 border-2 ${o.cls}`} style={{ '--ticket-backing': 'hsl(var(--sidebar))' } as CSSProperties}>
                  <div className="text-[11px] text-muted-foreground mb-1">{o.state}</div>
                  <div className="ticket-number text-foreground text-lg">{o.num}</div>
                  <div className="text-[11px] text-muted-foreground mt-1">طاولة {o.table}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <span className="section-title">المميزات</span>
          <h2 className="text-3xl font-bold text-foreground">
            دكان — كل ما تحتاجه
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <FeatureCard key={i} icon={f.icon} title={f.title} desc={f.desc} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 py-20 border-t border-border">
        <div className="text-center mb-12">
          <span className="section-title">الخطوات</span>
          <h2 className="text-3xl font-bold text-foreground">كيف يعمل</h2>
        </div>

        <div className="max-w-xl mx-auto grid grid-cols-1 gap-8">
          {steps.map((s, i) => (
            <StepCard
              key={i}
              number={String(i + 1)}
              title={s.title}
              desc={s.desc}
            />
          ))}
        </div>
      </section>

      {/* Bahrain features highlight */}
      <section className="max-w-6xl mx-auto px-4 py-20 border-t border-border">
        <div className="bg-card border border-border rounded-3xl p-8 md:p-12
                        flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <div className="text-4xl mb-4">🇧🇭</div>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Built for Bahrain
            </h2>
            <div className="space-y-3">
              {[
                { en: 'BHD currency with 3 decimal precision', ar: 'عملة البحرين (د.ب.) بدقة 3 خانات عشرية' },
                { en: 'Full Arabic RTL interface', ar: 'واجهة عربية كاملة من اليمين لليسار' },
                { en: 'All 4 Bahrain governorates supported', ar: 'دعم المحافظات الأربع في البحرين' },
                { en: 'Pay at cashier — no payment gateway', ar: 'الدفع عند الكاشير — بدون بوابة دفع إلكتروني' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Check size={16} className="text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-foreground text-sm">{item.en}</span>
                    <span className="text-muted-foreground text-sm mx-2">·</span>
                    <span className="text-muted-foreground text-sm font-cairo">{item.ar}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mock menu preview */}
          <div className="flex-shrink-0 bg-background border border-border rounded-2xl p-4 w-full md:w-64">
            <div className="text-center mb-3">
              <div className="text-xs text-muted-foreground">واجهة العميل</div>
              <div className="font-bold text-foreground">مطعم الدوحة</div>
              <div className="text-xs text-muted-foreground">Doha Restaurant · طاولة 5</div>
            </div>
            <div className="space-y-2">
              {[
                { name: 'مچبوس', price: '3.500', tag: '🌶️' },
                { name: 'هريس', price: '1.800', tag: '⭐' },
                { name: 'قهوة عربية', price: '0.500', tag: '☕' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between
                                        bg-card rounded-xl px-3 py-2">
                  <div>
                    <div className="text-sm text-foreground font-cairo">
                      {item.tag} {item.name}
                    </div>
                    <div className="ticket-number text-xs text-primary">{item.price} د.ب.</div>
                  </div>
                  <button className="w-7 h-7 rounded-lg bg-brand-500
                                     flex items-center justify-center text-primary-foreground font-bold text-sm">
                    +
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center border-t border-border">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          هل أنت مستعد لتحديث مطعمك؟
        </h2>
        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">انضم إلى المطاعم في البحرين التي تستخدم دكان لطلبات QR أكثر ذكاءً.</p>
        <Button asChild size="lg">
          <Link href="/register">
            ابدأ مجاناً
            <ArrowRight size={18} className="rtl:rotate-180" />
          </Link>
        </Button>
        <p className="text-sm text-muted-foreground mt-4">لا يلزم وجود بطاقة ائتمانية</p>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row
                        items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="brand-icon !size-6 !rounded-lg">
              <span className="text-[10px] font-black">د</span>
            </div>
            <span className="text-foreground font-bold">دكان</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 دكان. البحرين 🇧🇭
          </p>
        </div>
      </footer>
    </div>
  );
}