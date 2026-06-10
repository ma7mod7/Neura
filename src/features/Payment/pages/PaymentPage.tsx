import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Lock, Zap, CreditCard } from 'lucide-react';

import axiosInstance from '../../../shared/api/axiosInstance';
import { useCreateCheckout, useVerifyPayment } from '../hooks/usePayment';
import type { PaymentStep, CourseInfo } from '../types/payment.types';

import { MeshBackground, FloatingParticles } from '../components/PaymentBackground';
import { StepDots, CheckoutButton, PageSkeleton } from '../components/PaymentUI';
import { CoursePanel } from '../components/CoursePanel';
import { WhatYouGet, OrderSummary } from '../components/OrderSummary';
import { ProcessingState, VerifyingState, SuccessState, ErrorState } from '../components/PaymentStates';

export default function PaymentPage() {
  const { courseId }       = useParams<{ courseId: string }>();
  const [searchParams]     = useSearchParams();
  const navigate           = useNavigate();
  const { t, i18n }        = useTranslation();
  const isRTL              = i18n.language === 'ar';

  const [step, setStep]               = useState<PaymentStep>('preview');
  const [errorMsg, setErrorMsg]       = useState('');
  const [enrollmentData, setEnrollmentData] = useState<{
    courseName?: string | null;
    courseThumbnail?: string | null;
  } | null>(null);

  const verifyMut   = useVerifyPayment();
  const checkoutMut = useCreateCheckout();

  //  Fetch course metadata (shared cache with CourseDetailsPage)
  const { data: course, isLoading } = useQuery<CourseInfo>({
    queryKey: ['coursesMetaDataById', courseId],
    queryFn:  async () => {
      const res = await axiosInstance.get(`api/Courses/${courseId}/metadata`);
      return res.data;
    },
    enabled:   !!courseId,
    staleTime: 1000 * 60 * 5,
  });

  //  Detect Stripe return 
  const hasVerified = useRef(false);
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId && courseId && !hasVerified.current) {
      hasVerified.current = true;
      setStep('verifying');
      verifyMut.mutate(courseId, {
        onSuccess: (data) => {
          setEnrollmentData({ courseName: data.courseName, courseThumbnail: data.courseThumbnail });
          setStep('success');
        },
        onError: (err: Error) => {
          setErrorMsg(err.message || t('payment.verifyError'));
          setStep('error');
        },
      });
    }
  }, [searchParams, courseId, verifyMut, t]);

  //  Handlers 
  const handleCheckout = () => {
    if (!courseId) return;
    setStep('processing');
    checkoutMut.mutate(courseId, {
      onSuccess: ({ sessionUrl }) => {
        if (sessionUrl) {
          window.location.href = sessionUrl;
        } else {
          setErrorMsg(t('payment.noSessionUrl'));
          setStep('error');
        }
      },
      onError: (err: Error) => {
        setErrorMsg(err.message || t('payment.checkoutError'));
        setStep('error');
      },
    });
  };

  const handleRetry = () => { setStep('preview'); setErrorMsg(''); };

  const isStateScreen = ['processing', 'verifying', 'success', 'error'].includes(step);

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen font-inter">
      <MeshBackground />
      <FloatingParticles />

      {/*  Navbar */}
      <nav className="sticky top-0 z-50 border-b border-slate-200/60 dark:border-[#2a2a2e]/80 bg-white/70 dark:bg-[#0e0e10]/80 backdrop-blur-2xl">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors group"
          >
            <ArrowLeft size={16} className={`transition-transform group-hover:-translate-x-0.5 ${isRTL ? 'rotate-180' : ''}`} />
            {t('payment.back')}
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-[#222] border border-slate-200 dark:border-[#2a2a2e] text-xs text-slate-400">
            <Lock size={11} className="text-[#0061EF]" />
            <span>{t('payment.poweredByStripe')}</span>
          </div>
        </div>
      </nav>

      {/*  Main content */}
      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* State screens */}
        {isStateScreen && (
          <div className="max-w-lg mx-auto">
            <div className="rounded-3xl border border-white/60 dark:border-[#2a2a2e] bg-white/80 dark:bg-[#1A1A1A]/80 backdrop-blur-2xl shadow-2xl shadow-black/10 dark:shadow-black/50 p-8">
              {step === 'processing' && <ProcessingState t={t} />}
              {step === 'verifying'  && <VerifyingState  t={t} />}
              {step === 'success' && courseId && (
                <SuccessState
                  courseId={courseId}
                  courseName={enrollmentData?.courseName}
                  courseThumbnail={enrollmentData?.courseThumbnail}
                  t={t}
                  navigate={navigate}
                />
              )}
              {step === 'error' && (
                <ErrorState message={errorMsg} onRetry={handleRetry} t={t} />
              )}
            </div>
          </div>
        )}

        {/* Preview step */}
        {step === 'preview' && (
          <>
            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0061EF]/10 dark:bg-[#0061EF]/15 border border-[#0061EF]/20 dark:border-[#0061EF]/30 mb-5">
                <Zap size={12} className="text-[#0061EF]" />
                <span className="text-xs font-bold text-[#0061EF] tracking-wide uppercase">
                  {t('payment.securePayment')}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-3 leading-tight">
                {t('payment.completeEnrollment')}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-lg">
                {t('payment.oneStepAway')}
              </p>
              <StepDots step={step} />
            </div>

            {/* Content */}
            {isLoading ? (
              <PageSkeleton />
            ) : course ? (
              <div className="grid lg:grid-cols-[1fr_400px] gap-6 items-start">

                {/* Left column */}
                <div className="space-y-5">
                  <CoursePanel course={course} t={t} />
                  <WhatYouGet t={t} />

                  {/* Payment method */}
                  <div className="rounded-3xl border border-white/60 dark:border-[#2a2a2e] bg-white/70 dark:bg-[#1A1A1A]/70 backdrop-blur-2xl p-6">
                    <h4 className="font-bold text-slate-800 dark:text-white mb-4 text-sm">
                      {t('payment.paymentMethod')}
                    </h4>
                    <div className="flex items-center gap-4 p-4 rounded-2xl border-2 border-[#0061EF]/25 bg-[#0061EF]/5 dark:bg-[#0061EF]/8">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0061EF] to-blue-500 flex items-center justify-center shadow-lg shadow-[#0061EF]/30 shrink-0">
                        <CreditCard size={20} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 dark:text-white text-sm">{t('payment.stripeSecure')}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t('payment.stripeFullDesc')}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right column — sticky */}
                <div className="lg:sticky lg:top-20 space-y-4">
                  <OrderSummary
                    course={course}
                    t={t}
                    onCheckout={handleCheckout}
                    isPending={checkoutMut.isPending}
                  />
                  <div className="rounded-3xl border border-white/60 dark:border-[#2a2a2e] bg-white/70 dark:bg-[#1A1A1A]/70 backdrop-blur-2xl p-5">
                    <CheckoutButton t={t} onClick={handleCheckout} disabled={checkoutMut.isPending} />
                    <p className="text-center text-[11px] text-slate-400 mt-3 leading-relaxed">
                      {t('payment.termsNote')}
                    </p>
                  </div>
                </div>

              </div>
            ) : (
              <div className="text-center py-20 text-slate-400">
                {t('payment.courseNotFound')}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}