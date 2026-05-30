const CourseCardSkeleton = () => {
    return (
        <div className="bg-[#F6FAFF] dark:bg-[#1A1A1A] w-full rounded-[1rem] overflow-hidden shadow-md border border-slate-200 dark:border-[#2a2a2e] flex flex-col h-full animate-pulse">
            
            {/* Image Placeholder */}
            <div className="relative aspect-video p-3">
                <div className="w-full h-full bg-slate-200 dark:bg-slate-800 rounded-[1.5rem]" />
                {/* Bookmark Button Placeholder */}
                <div className="absolute top-5 end-5 w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-700 shadow-md" />
            </div>

            <div className="p-5 flex flex-col flex-1">
                {/* Tags Section */}
                <div className="flex flex-wrap gap-2 mb-3">
                    <div className="w-12 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="w-16 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
                </div>

                {/* Title */}
                <div className="w-full h-5 bg-slate-200 dark:bg-slate-800 rounded mb-2" />
                <div className="w-2/3 h-5 bg-slate-200 dark:bg-slate-800 rounded mb-4" />

                {/* Instructor */}
                <div className="w-1/2 h-3 bg-slate-200 dark:bg-slate-800 rounded mb-6" />

                {/* Stats (Rating, Hours, Lectures) */}
                <div className="flex items-center gap-2 mb-6">
                    <div className="w-12 h-6 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                    <div className="w-12 h-6 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                    <div className="w-16 h-6 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                </div>

                {/* Bottom Section (Price & Enroll) */}
                <div className="lg:mt-auto flex items-center justify-between">
                    <div className="flex gap-2 items-center">
                        <div className="w-16 h-5 bg-slate-200 dark:bg-slate-800 rounded" />
                        <div className="w-6 h-6 bg-slate-200 dark:bg-slate-800 rounded-full" />
                    </div>
                    <div className="w-24 h-8 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                </div>
            </div>
        </div>
    );
};

export default CourseCardSkeleton;
