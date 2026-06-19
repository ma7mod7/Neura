import { useRef, useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Loader2,
} from "lucide-react";
import { useTranslation } from "react-i18next";

interface VideoPlayerProps {
  videoUrl: string | null;
  isLoading: boolean;
  lessonTitle: string;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

export default function VideoPlayer({
  videoUrl,
  isLoading,
  lessonTitle,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: VideoPlayerProps) {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ================= Auto-hide controls =================
  const resetTimer = () => {
    setShowControls(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );
  useEffect(() => {
    setIsPlaying(false);
    setProgress(0);
  }, [videoUrl]);

  // ================= Handlers =================
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const { currentTime, duration } = videoRef.current;
    if (duration) setProgress((currentTime / duration) * 100);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    videoRef.current.currentTime =
      ((e.clientX - rect.left) / rect.width) * videoRef.current.duration;
  };

  return (
    <div
      className="relative w-full bg-black"
      style={{ aspectRatio: "16/9" }}
      onMouseMove={resetTimer}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* ====== Loading ====== */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
          <Loader2 size={52} className="text-white animate-spin opacity-60" />
        </div>
      )}

      {/* ====== Empty State ====== */}
      {!isLoading && !videoUrl && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#111] z-10">
          <Play size={60} className="text-gray-600 mb-4" />
          <p className="text-gray-500 text-sm">
            {t('courses.selectLessonToWatch')}
          </p>
        </div>
      )}

      {/* ====== Video ====== */}
      {videoUrl && (
        <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-contain cursor-pointer"
            onTimeUpdate={handleTimeUpdate}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => {
                setIsPlaying(false);
                onNext();
            }}
            onClick={togglePlay}
            onContextMenu={(e) => e.preventDefault()}
            controlsList="nodownload noremoteplayback"
            disablePictureInPicture
            playsInline
        />
      )}

      {/* ====== Prev Button ====== */}
      <button
        onClick={onPrev}
        disabled={!hasPrev}
        className={`absolute start-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all
                    ${hasPrev ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg" : "bg-black/30 text-gray-600 cursor-not-allowed"}`}
      >
        <ChevronLeft size={20} className="rtl:rotate-180" />
      </button>

      {/* ====== Next Button ====== */}
      <button
        onClick={onNext}
        disabled={!hasNext}
        className={`absolute end-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all
                    ${hasNext ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg" : "bg-black/30 text-gray-600 cursor-not-allowed"}`}
      >
        <ChevronRight size={20} className="rtl:rotate-180" />
      </button>

      {/* ====== Controls Bar ====== */}
      {videoUrl && (
        <div
          className={`absolute bottom-0 inset-x-0 z-20 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"}`}
        >
          {/* Progress Bar */}
          <div
            className="w-full h-1 bg-white/20 cursor-pointer hover:h-2 transition-all"
            onClick={handleSeek}
          >
            <div
              className="h-full bg-blue-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          {/* Buttons */}
          <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="text-white hover:text-blue-400 transition-colors"
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>
              <button
                onClick={toggleMute}
                className="text-white hover:text-blue-400 transition-colors"
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <span className="text-white/70 text-xs truncate max-w-[200px]">
                {lessonTitle}
              </span>
            </div>
            <button
              onClick={() => videoRef.current?.requestFullscreen()}
              className="text-white hover:text-blue-400 transition-colors"
            >
              <Maximize size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
