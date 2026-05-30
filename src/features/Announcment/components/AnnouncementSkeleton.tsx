const AnnouncementSkeleton = () => {
    return (
        <div className="bg-white dark:bg-[#1c1c1f] rounded-xl p-6 shadow-sm mb-6 border border-slate-200 dark:border-[#2a2a2e] relative animate-pulse">
            {/* --- Header --- */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full border-2 border-slate-200 dark:border-[#2a2a2e] bg-slate-200 dark:bg-slate-800 p-0.5" />
                    <div className="flex flex-col gap-2">
                        <div className="w-32 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
                        <div className="w-24 h-3 bg-slate-200 dark:bg-slate-800 rounded" />
                    </div>
                </div>

                {/* Options button skeleton */}
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800" />
            </div>

            {/* --- Title --- */}
            <div className="w-1/2 h-5 bg-slate-200 dark:bg-slate-800 rounded mb-4" />

            {/* --- Content --- */}
            <div className="flex flex-col gap-2 mb-4">
                <div className="w-full h-4 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="w-full h-4 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="w-3/4 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>

            {/* --- Image Placeholder --- */}
            <div className="rounded-2xl mb-4 border border-slate-100 dark:border-[#2a2a2e] bg-slate-200 dark:bg-slate-800 w-full h-48" />

            {/* --- Stats --- */}
            <div className="pt-4 border-t border-slate-100 dark:border-[#2a2a2e]" />
            <div className="flex items-center justify-between gap-4 mt-2">
                <div className="w-16 h-3 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="w-20 h-3 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>

            {/* --- Actions --- */}
            <div className="flex items-center gap-6 mt-4 pt-2 justify-between">
                <div className="w-6 h-6 bg-slate-200 dark:bg-slate-800 rounded-full" />
                <div className="w-6 h-6 bg-slate-200 dark:bg-slate-800 rounded-full" />
            </div>
        </div>
    );
};

export default AnnouncementSkeleton;
