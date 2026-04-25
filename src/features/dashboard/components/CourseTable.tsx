import { Pencil, Trash2 } from 'lucide-react';
import type { ApiCourseItem } from '../types';

interface CourseTableProps {
    courses: ApiCourseItem[];
    onDelete: (id: string) => void;
    onEditOrContinue: (id: string) => void;
}

export default function CourseTable({ courses, onDelete, onEditOrContinue }: CourseTableProps) {
    if (courses.length === 0) {
        return <div className="text-center text-gray-500 dark:text-slate-400 py-10">No courses found.</div>;
    }

    return (
        <div className="overflow-x-auto pb-4">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-blue-600 text-white text-left text-sm font-medium">
                        <th className="p-4 rounded-tl-lg w-1/2">Course</th>
                        <th className="p-4 w-1/6 text-center">Status</th>
                        <th className="p-4 w-1/6 text-center">Students</th>
                        <th className="p-4 rounded-tr-lg w-1/6 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {courses.map((course, index) => {
                        // معالجة مشكلة الـ backslash في مسار الصورة الجاي من الباك إند
                        const safeImageUrl = course.imageUrl?.replace(/\\/g, '/');

                        return (
                            <tr
                                key={course.keyId}
                                className={`border-b border-gray-100 dark:border-[#2a2a2e] hover:bg-gray-50 dark:hover:bg-[#2a2a2e] transition-colors ${index % 2 === 0 ? 'bg-gray-50/50 dark:bg-[#1c1c1f]' : 'bg-white dark:bg-[#0e0e10]'}`}
                            >
                                <td className="p-4">
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={safeImageUrl}
                                            alt={course.title}
                                            className="w-12 h-12 rounded bg-gray-300 dark:bg-[#2a2a2e] object-cover"
                                            onError={(e) => {
                                                // صورة افتراضية لو الصورة الحقيقية فيها مشكلة
                                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/50';
                                            }}
                                        />
                                        <div>
                                            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-400 line-clamp-1">{course.title}</h3>
                                            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                                                {course.instructorName || 'No Instructor'}
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                <td className="p-4 text-center">
                                    <span className={`inline-flex items-center justify-center px-3 py-1 text-xs font-medium rounded-full border ${
                                        course.statusName === 'Active'
                                            ? 'bg-green-50 dark:bg-green-500/10 text-green-600 border-green-300 dark:border-green-500/30'
                                            : course.statusName === 'Pending'
                                            ? 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 border-yellow-300 dark:border-yellow-500/30'
                                            : 'bg-gray-50 dark:bg-[#2a2a2e] text-gray-600 dark:text-slate-400 border-gray-300 dark:border-[#3a3a3e]'
                                    }`}>
                                        {course.statusName}
                                    </span>
                                </td>

                                <td className="p-4 text-center text-sm text-gray-600 dark:text-slate-400">
                                    {course.numberOfStudents.toLocaleString()}
                                </td>

                                <td className="p-4">
                                    <div className="flex items-center justify-end gap-3">
                                        {course.statusName === 'Pending' && (
                                            <button
                                                onClick={() => onEditOrContinue(course.keyId)}
                                                className="text-xs bg-blue-50 dark:bg-[#0061EF]/10 text-blue-600 border border-blue-200 dark:border-[#0061EF]/30 px-2 py-1 rounded hover:bg-blue-100 dark:hover:bg-[#0061EF]/20 transition-colors font-medium whitespace-nowrap"
                                            >
                                                Continue setup
                                            </button>
                                        )}

                                        {/* نستخدم availableActions للتحكم في الأزرار */}
                                        {course.availableActions?.canEdit && (
                                            <button
                                                onClick={() => onEditOrContinue(course.keyId)}
                                                className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
                                                title="Edit Course"
                                            >
                                                <Pencil size={18} />
                                            </button>
                                        )}
                                        
                                        {course.availableActions?.canDelete && (
                                            <button
                                                onClick={() => onDelete(course.keyId)}
                                                className="text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
                                                title="Delete Course"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}