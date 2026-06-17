import { CreditCard, CheckCircle2, Sparkles } from 'lucide-react';
import { CheckoutButton, TrustStrip } from './PaymentUI';
import type { CourseInfo } from '../types/payment.types';

export function WhatYouGet({ t }: { t: (k: string) => string }) {
  const perks = ['payment.perk1', 'payment.perk2', 'payment.perk3', 'payment.perk4'];
  return (
    <div className="rounded-3xl border border-white/60 dark:border-[#2a2a2e] bg-white/70 dark:bg-[#1A1A1A]/70 backdrop-blur-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-xl bg-[#0061EF]/10 dark:bg-[#0061EF]/20 flex items-center justify-center">
          <Sparkles size={13} className="text-[#0061EF]" />
        </div>
        <h4 className="font-bold text-slate-800 dark:text-white text-sm">{t('payment.whatYouGet')}</h4>
      </div>
      <ul className="space-y-2.5">
        {perks.map((k) => (
          <li key={k} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300">
            <CheckCircle2 size={15} className="text-[#0061EF] shrink-0 mt-0.5" />
            {t(k)}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function OrderSummary({
  course, t, onCheckout, isPending,
}: {
  course: CourseInfo;
  t: (k: string) => string;
  onCheckout: () => void;
  isPending: boolean;
}) {
  
  const total = course.price;

  return (
    <div className="rounded-3xl border border-white/60 dark:border-[#2a2a2e] bg-white/70 dark:bg-[#1A1A1A]/70 backdrop-blur-2xl p-6 shadow-xl shadow-black/5 dark:shadow-black/30">
      <h4 className="font-bold text-slate-900 dark:text-white mb-5 text-sm">{t('payment.orderSummary')}</h4>

      <div className="space-y-3 mb-5">
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-500 dark:text-slate-400">{t('payment.subtotal')}</span>
          <span className="font-semibold text-slate-800 dark:text-white">USD {course.price.toLocaleString()}</span>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-[#2a2a2e] to-transparent" />
        <div className="flex justify-between items-center">
          <span className="font-bold text-slate-900 dark:text-white">{t('payment.total')}</span>
          <div className="text-end">
            <div className="text-xl font-black text-[#0061EF]">USD {total.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-5 p-3 rounded-2xl bg-slate-50 dark:bg-[#222]/80 border border-slate-100 dark:border-[#2a2a2e]">
        <CreditCard size={14} className="text-[#0061EF] shrink-0" />
        <span className="text-xs text-slate-500 dark:text-slate-400 flex-1">{t('payment.stripeDesc')}</span>
        <div className="flex gap-1">
          {['VISA', 'MC', 'AMEX'].map((b) => (
            <span key={b} className="text-[9px] font-black px-1.5 py-0.5 rounded bg-white dark:bg-[#2a2a2e] border border-slate-200 dark:border-[#333] text-slate-600 dark:text-slate-300 shadow-sm">
              {b}
            </span>
          ))}
        </div>
      </div>

      <CheckoutButton t={t} onClick={onCheckout} disabled={isPending} />

      <p className="text-center text-[11px] text-slate-400 mt-4 leading-relaxed">
        {t('payment.termsNote')}
      </p>
      <TrustStrip t={t} />
    </div>
  );
}