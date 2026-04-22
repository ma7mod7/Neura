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
    
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className="flex items-center justify-end gap-2 text-sm font-medium text-gray-600">
            <button 
                onClick={() => onPageChange(currentPage - 1)}
                disabled={!hasPreviousPage}
                className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
                <ChevronLeft size={16} />
            </button>
            
            {pages.map((page) => (
                <button 
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${
                        currentPage === page 
                        ? 'bg-gray-300 text-gray-800 cursor-default' 
                        : 'hover:bg-gray-100 text-gray-600'
                    }`}
                >
                    {page}
                </button>
            ))}

            <button 
                onClick={() => onPageChange(currentPage + 1)}
                disabled={!hasNextPage}
                className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
                <ChevronRight size={16} />
            </button>
        </div>
    );
}