// components/Pagination.tsx
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination() {
    return (
        <div className="flex items-center justify-end gap-2 mt-8 text-sm font-medium text-gray-600">
            <button className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                <ChevronLeft size={16} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded">1</button>
            <button className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded">2</button>
            <button className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded">3</button>
            <button className="w-8 h-8 flex items-center justify-center bg-gray-300 rounded text-gray-700">4</button>
            <button className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded">5</button>
            <button className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded">6</button>
            <button className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                <ChevronRight size={16} />
            </button>
        </div>
    );
}