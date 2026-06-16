import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Loader2, Send } from 'lucide-react';
import { instructorApplicationSchema, type InstructorApplicationFormValues } from '../schema/instructorApplication.schema';

interface Props {
  defaultValues?: Partial<InstructorApplicationFormValues>;
  onSubmit: (data: InstructorApplicationFormValues) => void;
  isPending: boolean;
  submitLabel: string;
}

export const ApplicationForm: React.FC<Props> = ({ defaultValues, onSubmit, isPending, submitLabel }) => {
  const { t } = useTranslation();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<InstructorApplicationFormValues>({
    resolver: zodResolver(instructorApplicationSchema),
    defaultValues: { bio: defaultValues?.bio ?? '', experience: defaultValues?.experience ?? '' },
  });

  const bio = watch('bio') ?? '';
  const experience = watch('experience') ?? '';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-1.5">{t('instructorApp.bioLabel')}</label>
        <p className="text-xs text-slate-400 mb-2">{t('instructorApp.bioHint')}</p>
        <textarea
          {...register('bio')}
          rows={5}
          disabled={isPending}
          placeholder={t('instructorApp.bioPlaceholder')}
          className={`w-full px-4 py-3 text-sm rounded-2xl bg-white dark:bg-[#1A1A1A] text-slate-800 dark:text-white placeholder:text-slate-400 border-2 focus:outline-none transition-colors resize-none ${
            errors.bio ? 'border-red-300 focus:border-red-400' : 'border-slate-200 dark:border-[#2a2a2e] focus:border-[#0061EF]'
          }`}
        />
        <div className="flex items-center justify-between mt-1.5">
          {errors.bio ? <span className="text-xs text-red-500">{errors.bio.message}</span> : <span />}
          <span className={`text-xs ${bio.length > 2000 ? 'text-red-500' : 'text-slate-400'}`}>{bio.length}/2000</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-1.5">{t('instructorApp.experienceLabel')}</label>
        <p className="text-xs text-slate-400 mb-2">{t('instructorApp.experienceHint')}</p>
        <textarea
          {...register('experience')}
          rows={5}
          disabled={isPending}
          placeholder={t('instructorApp.experiencePlaceholder')}
          className={`w-full px-4 py-3 text-sm rounded-2xl bg-white dark:bg-[#1A1A1A] text-slate-800 dark:text-white placeholder:text-slate-400 border-2 focus:outline-none transition-colors resize-none ${
            errors.experience ? 'border-red-300 focus:border-red-400' : 'border-slate-200 dark:border-[#2a2a2e] focus:border-[#0061EF]'
          }`}
        />
        <div className="flex items-center justify-between mt-1.5">
          {errors.experience ? <span className="text-xs text-red-500">{errors.experience.message}</span> : <span />}
          <span className={`text-xs ${experience.length > 2000 ? 'text-red-500' : 'text-slate-400'}`}>{experience.length}/2000</span>
        </div>
      </div>

      <button type="submit" disabled={isPending} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#0061EF] hover:bg-[#0052cc] text-white font-bold text-sm transition-colors disabled:opacity-60">
        {isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        {submitLabel}
      </button>
    </form>
  );
};