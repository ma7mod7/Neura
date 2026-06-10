import { ShieldCheck, Lock, BadgeCheck, Globe } from 'lucide-react';
import type { PaymentStep } from '../types/payment.types';

export function StepDots({ step }: { step: PaymentStep }) {
  const steps: PaymentStep[] = ['preview', 'processing', 'success'];
  const idx = steps.indexOf(step);
  return (
    <div className="flex items-center gap-2 justify-center mb-8">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div
            className={`transition-all duration-500 rounded-full ${
              i <= idx
                ? 'w-8 h-2 bg-[#0061EF]'
                : 'w-2 h-2 bg-slate-200 dark:bg-[#2a2a2e]'
            }`}
          />
        </div>
      ))}
    </div>
  );
}

export function TrustStrip({ t }: { t: (k: string) => string }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-5 py-4 border-y border-slate-100 dark:border-[#2a2a2e] my-6">
      {[
        { Icon: ShieldCheck, key: 'payment.trust1' },
        { Icon: Lock,        key: 'payment.trust2' },
        { Icon: BadgeCheck,  key: 'payment.trust3' },
        { Icon: Globe,       key: 'payment.trust4' },
      ].map(({ Icon, key }) => (
        <div key={key} className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Icon size={13} className="text-[#0061EF]" />
          <span>{t(key)}</span>
        </div>
      ))}
    </div>
  );
}

export function CheckoutButton({
  t, onClick, disabled,
}: {
  t: (k: string) => string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="group relative w-full overflow-hidden rounded-2xl py-4 font-bold text-white text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
        bg-gradient-to-r from-[#0061EF] to-blue-500 hover:from-blue-700 hover:to-[#0061EF]
        shadow-lg shadow-[#0061EF]/30 hover:shadow-xl hover:shadow-[#0061EF]/40 active:scale-[0.98]"
    >
      <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      <span className="relative flex items-center justify-center gap-2">
        <Lock size={15} />
        {t('payment.proceedToCheckout')}
        {/* ChevronRight */}
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
      </span>
    </button>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-200 dark:bg-[#2a2a2e] ${className ?? ''}`} />;
}

export function PageSkeleton() {
  return (
    <div className="grid lg:grid-cols-[1fr_400px] gap-6">
      <div className="space-y-5">
        <Skeleton className="h-64" />
        <Skeleton className="h-44" />
        <Skeleton className="h-32" />
      </div>
      <div className="space-y-5">
        <Skeleton className="h-72" />
        <Skeleton className="h-14" />
      </div>
    </div>
  );
}