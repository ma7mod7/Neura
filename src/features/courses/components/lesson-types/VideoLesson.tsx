import { AlertCircle } from 'lucide-react';
import VideoPlayer from '../VideoPlayer';
import { useGetLessonVideoLink } from '../../api/useCoursePlayer';
import { useTranslation } from 'react-i18next';

interface VideoLessonProps {
    lessonId: string;
    lessonTitle: string;
    onPrev: () => void;
    onNext: () => void;
    hasPrev: boolean;
    hasNext: boolean;
}

// ===============================================================
// VIDEO LESSON (type = 1)
// ===============================================================

export default function VideoLesson({
    lessonId,
    lessonTitle,
    onPrev,
    onNext,
    hasPrev,
    hasNext,
}: VideoLessonProps) {
    const { data: videoData, isLoading, isError } = useGetLessonVideoLink(lessonId);
    const { t } = useTranslation();

    // ====== Error: 404 = not enrolled or video not ready ======
    if (isError) {
        return (
            <div
                className="w-full bg-black flex flex-col items-center justify-center gap-3"
                style={{ aspectRatio: '16/9' }}
            >
                <AlertCircle size={40} className="text-red-400" />
                <p className="text-white font-semibold text-sm">{t('courses.videoNotAvailable')}</p>
                <p className="text-gray-400 text-xs text-center max-w-xs">
                    {t('courses.videoAccessMessage')}
                </p>
            </div>
        );
    }

    return (
        <div className="w-full bg-black">
            <VideoPlayer
                // videoData returns { videoUrl, lessonId, durationSeconds, isVideoPrivate }
                videoUrl={videoData?.videoUrl ?? null}
                isLoading={isLoading}
                lessonTitle={lessonTitle}
                onPrev={onPrev}
                onNext={onNext}
                hasPrev={hasPrev}
                hasNext={hasNext}
            />
        </div>
    );
}
