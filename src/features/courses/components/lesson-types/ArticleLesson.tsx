import { Loader2, FileText } from 'lucide-react';

interface ArticleLessonProps {
    articleHtml: string | null;
    isLoading: boolean;
    lessonTitle: string;
}

// ===============================================================
// ARTICLE LESSON (type = 2)
// ===============================================================
export default function ArticleLesson({
    articleHtml,
    isLoading,
    lessonTitle,
}: ArticleLessonProps) {

    // ====== Loading ======
    if (isLoading) {
        return (
            <div className="w-full flex items-center justify-center bg-white dark:bg-[#1A1A1A]" style={{ minHeight: '420px' }}>
                <Loader2 size={40} className="animate-spin text-[#a435f0]" />
            </div>
        );
    }

    // ====== Empty ======
    if (!articleHtml) {
        return (
            <div className="w-full flex flex-col items-center justify-center bg-white dark:bg-[#1A1A1A]" style={{ minHeight: '420px' }}>
                <FileText size={48} className="text-gray-300 dark:text-[#2a2a2e] mb-3" />
                <p className="text-gray-400 dark:text-[#d0d0E0] text-sm">No content available for this lesson.</p>
            </div>
        );
    }

    return (
        <div className="w-full bg-white dark:bg-[#1A1A1A]">
            {/* Article Header */}
            <div className="px-8 pt-8 pb-4 border-b border-gray-100 dark:border-[#2a2a2e]">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-2">
                    <FileText size={18} />
                    <span className="text-sm font-semibold uppercase tracking-wide">Article</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-[#E0E0E0]">{lessonTitle}</h1>
            </div>

            {/* Article HTML Content */}
            <div
                className="px-8 py-6 prose prose-gray dark:prose-invert max-w-3xl
                    prose-headings:text-gray-800 dark:prose-headings:text-[#E0E0E0]
                    prose-p:text-gray-600 dark:prose-p:text-[#d0d0E0]
                    prose-a:text-[#a435f0] prose-a:no-underline hover:prose-a:underline
                    prose-code:bg-gray-100 dark:prose-code:bg-[#2a2a2e]
                    prose-pre:bg-gray-900 dark:prose-pre:bg-[#0e0e10]"
                dangerouslySetInnerHTML={{ __html: articleHtml }}
            />
        </div>
    );
}