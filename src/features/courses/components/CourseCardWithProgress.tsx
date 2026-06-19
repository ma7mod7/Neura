import CourseCard from '../../../shared/components/CourseCard';
import { useGetCourseProgress } from '../api/useCoursePlayer';
import { useGetCourseContent } from '../api/useCoursePlayer';


const parseDurationToSeconds = (duration: string | number | null | undefined): number => {
    if (!duration) return 0;
    if (typeof duration === 'number') return duration;
    if (typeof duration === 'string' && duration.includes(':')) {
        const parts = duration.split(':');
        if (parts.length === 3) {
            return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseFloat(parts[2]);
        }
    }
    return parseFloat(duration) || 0;
};

const CourseCardWithProgress = ({ course, showGoToCourse }: { course: any; showGoToCourse: boolean }) => {
    const { data: progressData } = useGetCourseProgress(course.keyId);
    const { data: contentData } = useGetCourseContent(course.keyId);

    const calculatedHours = (() => {
        if (!contentData?.sections) return course.hours ?? 0;
        const allLessons = contentData.sections.flatMap((s: any) => s.lessons || []);
        const totalSeconds = allLessons.reduce((acc: number, lesson: any) => {
            return acc + parseDurationToSeconds(lesson.duration);
        }, 0);
        return totalSeconds / 3600; 
    })();

    return (
        <CourseCard
            showGoToCourse={showGoToCourse}
            course={{
                ...course,
                isEnrolled: true,
                progressPercentage: progressData?.progressPercentage ?? 0,
                hours: calculatedHours,
                numberOfLessons: contentData?.totalLessons 
                    ?? contentData?.sections?.flatMap((s: any) => s.lessons || []).length 
                    ?? course.numberOfLessons,
            }}
        />
    );
};

export default CourseCardWithProgress;