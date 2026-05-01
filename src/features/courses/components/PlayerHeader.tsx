import { ArrowLeft, } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PlayerHeaderProps {
    courseTitle: string;
    courseId: string;
    rating?: number;
    completedCount: number;
    totalCount: number;
}

export default function PlayerHeader({
    courseTitle,
    
}: PlayerHeaderProps) {
    const navigate = useNavigate();

    return (
        <header className="h-14 flex items-center justify-between px-4 bg-[#1c1d1f] dark:bg-[#0e0e10] border-b border-[#3e4143] dark:border-[#2a2a2e] shrink-0 z-30">

            {/* ====== Left: Back + Course Title ====== */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors text-sm shrink-0"
                >
                    <ArrowLeft size={16} />
                    <span className="hidden sm:inline">Home</span>
                </button>

                <span className="text-[#3e4143] dark:text-[#2a2a2e]">|</span>

                <span className="text-sm font-medium text-white truncate max-w-xs lg:max-w-lg">
                    {courseTitle}
                </span>
            </div>

            {/* ====== Right: Progress + Certificate ====== */}
            <div className="flex items-center gap-3 shrink-0">

                {/* Progress Ring + Label */}
                {/* <div className="hidden sm:flex items-center gap-2">
                    <div className="relative w-7 h-7">
                        <svg className="w-7 h-7 -rotate-90" viewBox="0 0 28 28">
                            <circle cx="14" cy="14" r="11" fill="none" stroke="#3e4143" strokeWidth="2.5" />
                            <circle
                                cx="14" cy="14" r="11"
                                fill="none"
                                stroke="#a435f0"
                                strokeWidth="2.5"
                                strokeDasharray={`${2 * Math.PI * 11}`}
                                strokeDashoffset={`${2 * Math.PI * 11 * (1 - progressPercent / 100)}`}
                                strokeLinecap="round"
                                className="transition-all duration-500"
                            />
                        </svg>
                        <Trophy size={10} className="absolute inset-0 m-auto text-[#a435f0]" />
                    </div>
                    <button className="flex items-center gap-1 text-xs font-medium text-white hover:text-gray-300 transition-colors">
                        Your progress
                        <ChevronDown size={13} />
                    </button>
                </div> */}

                {/* Get Certificate */}
                {/* <button className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-white border border-white px-3 py-1.5 rounded hover:bg-white hover:text-black transition-colors">
                    <Trophy size={14} />
                    Get course certificate
                    <ChevronDown size={13} />
                </button> */}
            </div>
        </header>
    );
}