import { CreditCard, ShieldCheck, CheckCircle2, XCircle, Zap, Sparkles } from 'lucide-react';

export function ProcessingState({ t }: { t: (k: string) => string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-6 text-center">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 rounded-full border-4 border-[#0061EF]/15 border-t-[#0061EF] animate-spin" />
        <div className="absolute inset-3 rounded-full border-4 border-purple-500/10 border-b-purple-500 animate-spin"
          style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <CreditCard size={24} className="text-[#0061EF]" />
        </div>
      </div>
      <div>
        <p className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('payment.redirecting')}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">{t('payment.redirectingDesc')}</p>
      </div>
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="w-2 h-2 rounded-full bg-[#0061EF] animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  );
}

export function VerifyingState({ t }: { t: (k: string) => string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-6 text-center">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 rounded-full border-4 border-purple-500/15 border-t-purple-500 animate-spin"
          style={{ animationDuration: '1.2s' }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <ShieldCheck size={28} className="text-purple-500" />
        </div>
      </div>
      <div>
        <p className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('payment.verifying')}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">{t('payment.verifyingDesc')}</p>
      </div>
    </div>
  );
}

export function SuccessState({
  courseId, courseName, courseThumbnail, t, navigate,
}: {
  courseId: string;
  courseName?: string | null;
  courseThumbnail?: string | null;
  t: (k: string) => string;
  navigate: (to: string) => void;
}) {
  return (
    <div className="flex flex-col items-center py-12 gap-6 text-center">
      <div className="relative">
        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-green-400/20 to-emerald-500/10 dark:from-green-500/10 dark:to-emerald-500/5 flex items-center justify-center">
          <CheckCircle2 size={56} className="text-green-500" strokeWidth={1.5} />
        </div>
        <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-[#0061EF] flex items-center justify-center shadow-lg">
          <Sparkles size={14} className="text-white" />
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{t('payment.successTitle')}</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-1">{t('payment.successDesc')}</p>
        {courseName && <p className="text-sm font-semibold text-[#0061EF]">{courseName}</p>}
      </div>
      {courseThumbnail && (
        <img src={courseThumbnail} alt="" className="w-40 h-24 rounded-2xl object-cover shadow-xl" />
      )}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <button
          onClick={() => navigate(`/courses/${courseId}/learn`)}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#0061EF] hover:bg-blue-700 text-white font-bold text-sm transition-all duration-200 shadow-lg shadow-[#0061EF]/30 active:scale-[0.98]"
        >
          <Zap size={15} />
          {t('payment.startLearning')}
        </button>
        <button
          onClick={() => navigate('/courses')}
          className="flex-1 px-6 py-3 rounded-2xl border border-slate-200 dark:border-[#2a2a2e] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#2a2a2e] font-semibold text-sm transition-all duration-200"
        >
          {t('payment.browseCourses')}
        </button>
      </div>
    </div>
  );
}

export function ErrorState({
  message, onRetry, t,
}: {
  message: string;
  onRetry: () => void;
  t: (k: string) => string;
}) {
  return (
    <div className="flex flex-col items-center py-12 gap-6 text-center">
      <div className="w-28 h-28 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
        <XCircle size={56} className="text-red-500" strokeWidth={1.5} />
      </div>
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{t('payment.errorTitle')}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">{message}</p>
      </div>
      <button
        onClick={onRetry}
        className="px-8 py-3 rounded-2xl bg-[#0061EF] hover:bg-blue-700 text-white font-bold text-sm transition-all duration-200 shadow-lg shadow-[#0061EF]/30 active:scale-[0.98]"
      >
        {t('payment.tryAgain')}
      </button>
    </div>
  );
}