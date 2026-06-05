import React from 'react';
import type { ExamOption } from '../types/analysis.types';
import { useTranslation } from 'react-i18next';

interface Props {
  exams: ExamOption[];
  selected: string | null;
  onChange: (examId: string) => void;
  loading?: boolean;
}

export const ExamPicker: React.FC<Props> = ({ exams, selected, onChange, loading }) => {
  const { t } = useTranslation();
  if (loading) {
    return (
      <div className="flex items-center gap-3">
        <div className="h-4 w-20 animate-pulse bg-gray-200 dark:bg-[#2a2a2e] rounded" />
        <div className="h-10 w-72 animate-pulse bg-gray-100 dark:bg-[#2a2a2e] rounded-xl" />
      </div>
    );
  }

  if (!exams.length) return <p className="text-sm text-gray-400 dark:text-gray-500 italic">{t('analysis.noExamsFound')}</p>;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
      <label htmlFor="exam-select" className="text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
        {t('analysis.selectExamLabel')}
      </label>
      <select
        id="exam-select"
        value={selected ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="border border-gray-200 dark:border-[#2a2a2e] rounded-xl px-3 py-2 text-sm
                   bg-white dark:bg-[#0e0e10] text-gray-800 dark:text-gray-200
                   focus:outline-none focus:ring-2 focus:ring-blue-300 min-w-[260px] cursor-pointer"
      >
        <option value="" disabled>{t('analysis.pickAnExam')}</option>
        {exams.map((ex) => (
          <option key={ex.examId} value={ex.examId}>
            {ex.examTitle}  ·  {ex.courseTitle}
          </option>
        ))}
      </select>
    </div>
  );
};