import { ArrowUpRight, Bookmark, BookOpen, Clock, Star } from "lucide-react";
import useEnroll from "../../features/courses/api/useEnrolle";
import useBookMark from "../../features/courses/api/useBookMark";
import { useNavigate } from "react-router-dom";
import type { CourseListItem } from "../types/course";
import { useTranslation } from "react-i18next";

export interface Tag {
  id: number;
  name: string;
}

const CourseCard: React.FC<{ course: CourseListItem; showGoToCourse?: boolean }> = ({
  course,
  showGoToCourse = false,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isBookmarked = course.isBookmarked;
  const isEnrolled = course.isEnrolled;
  const { mutate: Enrollment, isPending } = useEnroll();
  const { mutate: Bookmarked, isPending: bookMarkPending } = useBookMark();

  const handleAddBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (bookMarkPending) return;
    Bookmarked(course.keyId);
  };

  const handleEnrollCard = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (showGoToCourse && isEnrolled) {
      navigate(`/courses/${course.keyId}/learn`);
      return;
    }

    const isFree = course.price === 0;
    if (isFree) {
      Enrollment(course.keyId);
    } else {
      navigate(`/courses/${course.keyId}/checkout`);
    }
  };

  const handleCardClick = () => {
    navigate(`/courses/${course.keyId}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-[#F6FAFF] dark:bg-[#1A1A1A] w-full rounded-[1rem] cursor-pointer overflow-hidden shadow-md border border-[#0061EF] dark:border-[#0061EF]/40 flex flex-col h-full transition-all duration-300 ease-in-out hover:scale-[1.03] hover:shadow-xl"
    >
      <div className="relative aspect-video">
        <img
          src={course.imageUrl}
          alt={course.title}
          className="w-full h-full object-cover p-3 rounded-[1.5rem]"
        />
        <button
          onClick={handleAddBookmark}
          disabled={bookMarkPending}
          className={`absolute top-5 end-5 p-2 rounded-full shadow-md transition-all duration-300 active:scale-90 z-10 ${
            isBookmarked
              ? "bg-[#0066FF] text-white"
              : "bg-white/90 dark:bg-[#2a2a2e]/90 backdrop-blur-sm text-slate-400 hover:text-[#0066FF]"
          }`}
        >
          <Bookmark size={16} fill={isBookmarked ? "currentColor" : "none"} />
        </button>

        {/* Progress bar overlay for enrolled courses */}
        {isEnrolled && course.progressPercentage !== undefined && (
          <div className="absolute bottom-3 left-3 right-3 z-10">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[10px] font-semibold text-white drop-shadow">
                {course.progressPercentage}% complete
              </span>
            </div>
            <div className="w-full h-1.5 bg-black/30 rounded-full overflow-hidden backdrop-blur-sm">
              <div
                className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full transition-all duration-500"
                style={{ width: `${course.progressPercentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        {/* Tags Section */}
        <div className="flex flex-wrap gap-2 mb-3">
          {Array.isArray(course.tags) && course.tags.length > 0 ? (
            course.tags.map((tag) => (
              <span
                key={tag.id}
                className="text-[10px] font-bold text-[#0061EF] uppercase tracking-wider bg-blue-100 dark:bg-[#0061EF]/15 px-2 py-0.5 rounded"
              >
                #{tag.name}
              </span>
            ))
          ) : (
            <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500">
              #{t("courses.general")}
            </span>
          )}
        </div>

        <h3 className="font-bold text-slate-800 dark:text-white mb-1 line-clamp-2">
          {course.title}
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-xs mb-4">
          {t("courses.instructorPrefix")} {course.instructorName}
        </p>

        <div className="flex items-center gap-2 mb-6">
          <div className="flex items-center gap-1 border border-slate-300 dark:border-[#2a2a2e] rounded-lg p-1">
            <Star size={14} className="fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {course.rating}
            </span>
          </div>
          <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 border border-slate-300 dark:border-[#2a2a2e] rounded-lg p-1">
            <Clock size={14} />
            <span className="text-[10px]">{course.hours}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 border border-slate-300 dark:border-[#2a2a2e] rounded-lg p-1">
            <BookOpen size={14} />
            <span className="text-[10px]">
              {t("courses.lectures", { count: course.numberOfLessons })}
            </span>
          </div>
        </div>

        <div className="lg:mt-auto flex items-center justify-between">
          <div className="flex gap-2">
            <span className="font-bold text-slate-900 dark:text-white">
              {course.price === 0
                ? t("common.free")
                : course.isEnrolled
                  ? t("courses.goToCourse")
                  : t("courses.price", { price: course.price })}
            </span>
            <span className="flex items-center">
              <ArrowUpRight
                size={24}
                className="bg-blue-600 rounded-full text-white p-1"
              />
            </span>
          </div>
         <button
            onClick={handleEnrollCard}
            disabled={isPending || (isEnrolled && !showGoToCourse)}
            className={`text-[#0061EF] text-xs font-bold px-4 py-2 rounded-lg border border-[#0061EF] hover:bg-[#0061EF] hover:text-white transition-all z-10 ${
              isEnrolled && !showGoToCourse
                ? "cursor-not-allowed bg-green-500 text-white border-green-500 hover:bg-green-500"
                : "cursor-pointer"
            }`}
          >
            {isPending
              ? t("common.loading")
              : showGoToCourse && isEnrolled
                ? t("courses.goToCourse")  
                : course.price === 0 || isEnrolled
                  ? t("courses.enrolled")
                  : t("courses.enrollNow")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
