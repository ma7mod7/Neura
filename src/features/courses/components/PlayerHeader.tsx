import { ArrowLeft, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface PlayerHeaderProps {
    courseTitle: string;
    courseId: string;
    rating?: number;
    completedCount: number;
    totalCount: number;
    progressPercent: number;
}

export default function PlayerHeader({
    courseTitle,
    completedCount,
    totalCount,
    progressPercent,
}: PlayerHeaderProps) {
    const navigate = useNavigate();
    const { t } = useTranslation();

    // SVG ring constants
    const radius = 11;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference * (1 - progressPercent / 100);

    return (
        <header className="h-14 flex items-center justify-between px-4 bg-[#1c1d1f] dark:bg-[#0e0e10] border-b border-[#3e4143] dark:border-[#2a2a2e] shrink-0 z-30">

            {/* ====== Left: Back + Course Title ====== */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors text-sm shrink-0"
                >
                    <ArrowLeft size={16} className="rtl:rotate-180" />
                    <span className="hidden sm:inline">{t('navigation.home')}</span>
                </button>

                <span className="text-[#3e4143] dark:text-[#2a2a2e]">|</span>

                <span className="text-sm font-medium text-white truncate max-w-xs lg:max-w-lg">
                    {courseTitle}
                </span>
            </div>

            {/* ====== Right: Progress Ring ====== */}
            <div className="flex items-center gap-3 shrink-0">

                {/* Progress Ring + Label */}
                <div className="flex items-center gap-2">
                    <div className="relative w-7 h-7">
                        <svg className="w-7 h-7 -rotate-90" viewBox="0 0 28 28">
                            {/* Background track */}
                            <circle
                                cx="14" cy="14" r={radius}
                                fill="none"
                                stroke="#3e4143"
                                strokeWidth="2.5"
                            />
                            {/* Progress arc */}
                            <circle
                                cx="14" cy="14" r={radius}
                                fill="none"
                                stroke="#a435f0"
                                strokeWidth="2.5"
                                strokeDasharray={`${circumference}`}
                                strokeDashoffset={`${strokeDashoffset}`}
                                strokeLinecap="round"
                                className="transition-all duration-500"
                            />
                        </svg>
                        <Trophy size={10} className="absolute inset-0 m-auto text-[#a435f0]" />
                    </div>
                    <div className="flex flex-col leading-none">
                        <span className="text-xs font-semibold text-white">
                            {progressPercent}%
                        </span>
                        <span className="text-[10px] text-gray-400 hidden sm:inline">
                            {completedCount}/{totalCount} {t('courses.lessonsLabel', { defaultValue: 'lessons' })}
                        </span>
                    </div>
                </div>
            </div>
        </header>
    );
}
