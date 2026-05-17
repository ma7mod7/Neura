import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    onPageChange: (page: number) => void;
}

export default function Pagination({ 
    currentPage, 
    totalPages, 
    hasNextPage, 
    hasPreviousPage, 
    onPageChange 
}: PaginationProps) {
    
    const getVisiblePages = () => {
        if (totalPages <= 5) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }
        
        if (currentPage <= 3) {
            return [1, 2, 3, 4, '...', totalPages];
        }
        
        if (currentPage >= totalPages - 2) {
            return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        }
        
        return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
    };

    const pages = getVisiblePages();

    return (
        <div className="flex items-center justify-end gap-2 text-sm font-medium text-gray-600 dark:text-slate-400">
            <button 
                onClick={() => onPageChange(currentPage - 1)}
                disabled={!hasPreviousPage}
                className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:bg-gray-300 dark:disabled:bg-[#2a2a2e] disabled:cursor-not-allowed shrink-0"
            >
                <ChevronLeft size={16} />
            </button>
            
            <div className="flex items-center gap-1">
                {pages.map((page, index) => {
                    if (page === '...') {
                        return (
                            <span key={`ellipsis-${index}`} className="w-8 h-8 flex items-center justify-center text-gray-400">
                                ...
                            </span>
                        );
                    }
                    
                    const pageNum = page as number;
                    return (
                        <button 
                            key={pageNum}
                            onClick={() => onPageChange(pageNum)}
                            className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${
                                currentPage === pageNum 
                                ? 'bg-gray-300 dark:bg-[#2a2a2e] text-gray-800 dark:text-white cursor-default' 
                                : 'hover:bg-gray-100 dark:hover:bg-[#2a2a2e] text-gray-600 dark:text-slate-400'
                            }`}
                        >
                            {pageNum}
                        </button>
                    );
                })}
            </div>

            <button 
                onClick={() => onPageChange(currentPage + 1)}
                disabled={!hasNextPage}
                className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:bg-gray-300 dark:disabled:bg-[#2a2a2e] disabled:cursor-not-allowed shrink-0"
            >
                <ChevronRight size={16} />
            </button>
        </div>
    );
}