import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, BookOpen, Search } from 'lucide-react';
import type { ExamOption } from '../types/analysis.types';

interface Props {
  exams: ExamOption[];
  selected: string | null;
  onChange: (id: string) => void;
  loading?: boolean;
}

export const ExamPicker: React.FC<Props> = ({ exams, selected, onChange, loading }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
 const triggerRef = useRef<HTMLButtonElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selectedExam = exams.find(e => e.examId === selected);

  const filtered = exams.filter(e =>
    e.examTitle.toLowerCase().includes(search.toLowerCase()) ||
    e.courseTitle.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = filtered.reduce<Record<string, ExamOption[]>>((acc, exam) => {
    if (!acc[exam.courseTitle]) acc[exam.courseTitle] = [];
    acc[exam.courseTitle].push(exam);
    return acc;
  }, {});

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const dropdownHeight = 320; 
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const showAbove = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

    setDropdownStyle({
      position: 'fixed',
      left: rect.left,
      width: rect.width,
      zIndex: 99999,
      ...(showAbove
        ? { bottom: window.innerHeight - rect.top + 8 }
        : { top: rect.bottom + 8 }
      ),
    });
  }, []);

  // Reposition on scroll
 useEffect(() => {
  if (!open) return;
  updatePosition();
  setTimeout(() => {
    searchRef.current?.focus({ preventScroll: true });
  }, 10);
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [open, updatePosition]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current && !triggerRef.current.contains(target) &&
        portalRef.current && !portalRef.current.contains(target)
      ) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (loading) {
    return <div className="h-12 bg-slate-100 dark:bg-[#2a2a2e] rounded-2xl animate-pulse" />;
  }

  const dropdown = open ? createPortal(
    <div
      ref={portalRef}
      style={dropdownStyle}
      className="bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#2a2a2e] rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/40 overflow-hidden"
    >
      {/* Search */}
      <div className="p-3 border-b border-slate-100 dark:border-[#2a2a2e]">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
         <input
            ref={searchRef}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search exams or courses..."
            className="w-full pl-8 pr-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-[#0e0e10] text-slate-800 dark:text-white placeholder:text-slate-400 border border-slate-200 dark:border-[#3a3a3e] focus:outline-none focus:border-blue-400 transition-colors"
          />
        </div>
      </div>

      {/* Options */}
      <div className="max-h-72 overflow-y-auto py-2">
        {Object.keys(grouped).length === 0 ? (
          <p className="text-center text-sm text-slate-400 py-6">No exams found</p>
        ) : (
          Object.entries(grouped).map(([course, courseExams]) => (
            <div key={course}>
              <div className="px-4 py-1.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  {course}
                </p>
              </div>
              {courseExams.map(exam => (
                <button
                  key={exam.examId}
                  onClick={() => { onChange(exam.examId); setOpen(false); setSearch(''); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-100 ${
                    exam.examId === selected
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                      : 'hover:bg-slate-50 dark:hover:bg-[#2a2a2e] text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${exam.examId === selected ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                  <span className="text-sm font-medium truncate">{exam.examTitle}</span>
                  {exam.examId === selected && (
                    <span className="ml-auto text-xs font-semibold text-blue-500">Selected</span>
                  )}
                </button>
              ))}
            </div>
          ))
        )}
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <div className="relative w-full">
      <button
        ref={triggerRef}
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 bg-white dark:bg-[#1A1A1A] border-2 rounded-2xl transition-all duration-200 ${
          open
            ? 'border-blue-500 shadow-lg shadow-blue-500/10'
            : 'border-slate-200 dark:border-[#2a2a2e] hover:border-blue-300 dark:hover:border-[#3a3a3e]'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
            <BookOpen size={15} className="text-blue-600" />
          </div>
          {selectedExam ? (
            <div className="text-left min-w-0">
              <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{selectedExam.examTitle}</p>
              <p className="text-xs text-slate-400 truncate">{selectedExam.courseTitle}</p>
            </div>
          ) : (
            <span className="text-sm text-slate-400">— pick an exam —</span>
          )}
        </div>
        <ChevronDown size={16} className={`text-slate-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {dropdown}
    </div>
  );
};