import { useTranslation } from 'react-i18next';
import type { ExamOption } from '../types/analysis.types';
import { ChevronDown } from 'lucide-react';

interface ExamPickerProps {
  exams: ExamOption[];
  selected: string | null;
  onChange: (examId: string) => void;
  loading?: boolean;
}

export const ExamPicker: React.FC<ExamPickerProps> = ({ exams, selected, onChange, loading }) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="flex items-center gap-3">
        <div className="h-4 w-24 animate-pulse bg-slate-200 dark:bg-[#2a2a2e] rounded-lg" />
        <div className="h-11 w-72 animate-pulse bg-slate-100 dark:bg-[#2a2a2e] rounded-2xl" />
      </div>
    );
  }

  if (!exams.length) {
    return <p className="text-sm text-slate-400 dark:text-slate-500 italic">{t('analysis.noExamsFound')}</p>;
  }

  return (
    <div className="relative w-full sm:w-auto sm:inline-block">
      <select
        id="exam-select"
        value={selected ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none w-full sm:min-w-[300px] pl-4 pr-10 py-3 text-sm rounded-2xl
                   border border-slate-200 dark:border-[#2a2a2e]
                   bg-white/80 dark:bg-[#111]/80 backdrop-blur-sm
                   text-slate-800 dark:text-slate-200
                   focus:outline-none focus:ring-2 focus:ring-[#0061EF]/30
                   cursor-pointer transition-all font-medium shadow-sm"
      >
        <option value="" disabled>{t('analysis.pickAnExam')}</option>
        {exams.map((ex) => (
          <option key={ex.examId} value={ex.examId}>
            {ex.examTitle}  ·  {ex.courseTitle}
          </option>
        ))}
      </select>
      <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  );
};