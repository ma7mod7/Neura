interface EnrolledCourse {
    id: string;
    title: string;
    lessonName: string;
    currentLecture: number;
    image: string;
    time: Date | string;
}


const LearningCard: React.FC<{ course: EnrolledCourse }> = ({ course }) => (
    <div className="flex h-52 w-full overflow-hidden rounded-xl shadow-sm border border-blue-100/50  dark:border-[#2a2a2e] cursor-pointer group hover:shadow-md transition-all">
        {/* Left Side: Black Image Section */}
        <div className="w-[40%] bg-black flex items-center justify-center overflow-hidden">
            <img
                src={course.image}
                alt={course.title}
                className="h-full w-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-500"
            />
        </div>

        {/* Right Side: Light Blue Content Section */}
        <div className="flex-1 bg-[#D5E6FF] dark:bg-[#1a2a3f] p-4 flex flex-col justify-between">
            <div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-1">
                    {course.title}
                </p>
                <h4 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                    {course.lessonName}
                </h4>
            </div>

            <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-200">Lecture</span>
                <span className="text-xs text-slate-400 dark:text-slate-500">{typeof course.time === 'string' ? course.time : course.time.toString()}</span>
            </div>
        </div>
    </div>
);

export default LearningCard;