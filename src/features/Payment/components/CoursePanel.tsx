import { Star, Clock, BookOpen, Lock, Sparkles, Users } from 'lucide-react';
import type { CourseInfo } from '../types/payment.types';

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-slate-50 dark:bg-[#222]/80">
      {icon}
      <span className="text-sm font-bold text-slate-800 dark:text-white">{value}</span>
      <span className="text-[10px] text-slate-400 leading-none">{label}</span>
    </div>
  );
}

export function CoursePanel({
  course, t,
}: {
  course: CourseInfo;
  t: (k: string, o?: Record<string, unknown>) => string;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/60 dark:border-[#2a2a2e] bg-white/70 dark:bg-[#1A1A1A]/70 backdrop-blur-2xl shadow-xl shadow-black/5 dark:shadow-black/40">

      {course.imageUrl ? (
        <div className="relative h-52 overflow-hidden">
          <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute top-4 end-4">
            <div className="px-4 py-1.5 rounded-full bg-white/20 dark:bg-black/40 backdrop-blur-md border border-white/30 text-white font-bold text-sm shadow-lg">
              {course.price === 0 ? t('payment.free') : `EGP ${course.price.toLocaleString()}`}
            </div>
          </div>
          <div className="absolute bottom-4 start-4 flex items-center gap-1.5 text-white/80 text-xs">
            <Lock size={11} />
            <span>{t('payment.securedByStripe')}</span>
          </div>
        </div>
      ) : (
        <div className="h-28 bg-gradient-to-br from-[#0061EF] to-purple-600 relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <Sparkles size={64} className="text-white" />
          </div>
        </div>
      )}

      <div className="p-6">
        {course.tags && course.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {course.tags.slice(0, 3).map((tag) => (
              <span key={tag.id} className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#0061EF]/10 dark:bg-[#0061EF]/15 text-[#0061EF] dark:text-blue-300">
                #{tag.name}
              </span>
            ))}
          </div>
        )}

        <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-snug mb-1">
          {course.title}
        </h2>

        {course.instructorName && (
          <div className="text-sm text-slate-500 dark:text-slate-400 mb-5">
            {t('payment.by')}{' '}
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {course.instructorName}
            </span>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          {course.rating && (
            <StatCard icon={<Star size={14} className="text-yellow-400 fill-yellow-400" />} value={String(course.rating)} label={t('payment.rating')} />
          )}
          {course.hours && (
            <StatCard icon={<Clock size={14} className="text-[#0061EF]" />} value={`${course.hours}h`} label={t('payment.hours')} />
          )}
          {course.numberOfLessons && (
            <StatCard icon={<BookOpen size={14} className="text-purple-500" />} value={String(course.numberOfLessons)} label={t('payment.lessons')} />
          )}
          {course.numberOfStudents && (
            <StatCard icon={<Users size={14} className="text-emerald-500" />} value={course.numberOfStudents.toLocaleString()} label={t('payment.students')} />
          )}
        </div>
      </div>
    </div>
  );
}