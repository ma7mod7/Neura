import { ArrowUpRight, Bookmark, BookOpen, Clock, Star } from "lucide-react";
import useEnroll from "../../features/courses/api/useEnrolle";
import useBookMark from "../../features/courses/api/useBookMark";
import { useNavigate } from "react-router-dom";

export interface Tag {
    id: number;
    name: string;
}
interface Course {
    id: string;
    image: string;
    category: Tag[];
    title: string;
    instructor: string;
    rating: number;
    duration: string;
    lectures: number;
    price: number;
    enrolled: boolean,
    bookMarked: boolean

}

const CourseCard: React.FC<{ course: Course }> = ({ course }) => {
    const navigate=useNavigate()
    const isBookmarked = course.bookMarked;
    const isEnrolled = course.enrolled;
    const { mutate:Enrollment, isPending } = useEnroll()
    const { mutate:Bookmarked, isPending:bookMarkPending } = useBookMark()

    const handleAddBookmark = () => {
        if (bookMarkPending) return;
        Bookmarked(course.id);
    };

    const handleEnroll = () => {
        Enrollment(course.id);
    };


    return (
        <div  className="bg-[#F6FAFF]  xl:w-[440px] rounded-[1rem] overflow-hidden shadow-md border border-[#0061EF] flex flex-col h-full hover:shadow-xl transition-shadow ">
            <div className="relative aspect-video ">
                <img src={course.image} alt={course.title} className="w-full h-full object-cover p-3 rounded-[1.5rem]  " />
                <button
                    onClick={handleAddBookmark}
                    
                    className={`absolute top-5 right-5 p-2 rounded-full shadow-md transition-all duration-300 active:scale-90 ${isBookmarked
                        ? 'bg-[#0066FF] text-white' // Active state
                        : 'bg-white/90 backdrop-blur-sm text-slate-400 hover:text-[#0066FF]' // Inactive state
                        }`}
                >
                    <Bookmark
                        size={16}
                        fill={isBookmarked ? "currentColor" : "none"} // Fills the icon when active
                    />
                </button>
            </div>

            <div className="p-5 flex flex-col flex-1">

                {/* Tags Section */}
                <div className="flex flex-wrap gap-2 mb-3">
                    {Array.isArray(course.category) && course.category.length > 0 ? (
                        course.category.map((tag) => (
                            <span
                                key={tag.id}
                                className="text-[10px] font-bold text-[#0061EF] uppercase tracking-wider bg-blue-100 px-2 py-0.5 rounded"
                            >
                                #{tag.name}
                            </span>
                        ))
                    ) : (

                        <span className="text-[10px] font-bold text-gray-400">#General</span>
                    )}
                </div>

                <h3 className="font-bold text-slate-800  mb-1 line-clamp-2">{course.title}</h3>
                <p className="text-slate-500 text-xs mb-4">Dr. {course.instructor}</p>

                <div className="flex items-center gap-2 mb-6">
                    <div className="flex items-center gap-1 border  border-slate-300 rounded-lg p-1">
                        <Star size={14} className="fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-bold text-slate-700">{course.rating}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 border border-slate-300 rounded-lg p-1">
                        <Clock size={14} />
                        <span className="text-[10px]">{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 border border-slate-300 rounded-lg p-1">
                        <BookOpen size={14} />
                        <span className="text-[10px]">{course.lectures} lectures</span>
                    </div>
                </div>

                <div className="lg:mt-auto flex items-center justify-between  ">
                    <div className="flex gap-2">
                    <span className="font-bold text-slate-900">{course.price === 0 ? 'Free' : `${course.price} E.L`}</span>
                    <span onClick={()=>navigate(`/courses/${course.id}`)} className="cursor-pointer">
                        <ArrowUpRight  size={24} className="bg-blue-600 rounded-full text-white"/>
                    </span>
                    </div>
                    <button onClick={handleEnroll} disabled={isPending || isEnrolled} className="text-[#0061EF] text-xs font-bold px-4 py-2 rounded-lg border border-[#0061EF] hover:bg-[#0061EF] hover:text-white transition-all">
                        {isPending
                            ? "Loading..."
                            : (course.price === 0 ? (isEnrolled ? "Course Enrolled" : "Enroll") : "Add to Cart")
                        }
                    </button>
                </div>
            </div>
        </div>
    )


};
export default CourseCard;