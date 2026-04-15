// components/CourseTable.tsx
import { Pencil, Trash2 } from 'lucide-react';
import type { Course } from '../types';

interface CourseTableProps {
    courses: Course[];
    onDelete: (id: string) => void;
    onEditOrContinue: (id: string) => void;
}

export default function CourseTable({ courses, onDelete, onEditOrContinue }: CourseTableProps) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-blue-600 text-white text-left text-sm font-medium">
                        <th className="p-4 rounded-tl-lg w-1/2">Course</th>
                        <th className="p-4 w-1/6 text-center">status</th>
                        <th className="p-4 w-1/6 text-center">Students</th>
                        <th className="p-4 rounded-tr-lg w-1/6 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {courses.map((course, index) => (
                        <tr
                            key={course.id}
                            className={`border-b border-transparent ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                        >
                            <td className="p-4">
                                <div className="flex items-center gap-4">
                                    <img
                                        src={course.image}
                                        alt="Course thumbnail"
                                        className="w-12 h-12 rounded bg-gray-300 object-cover"
                                    />
                                    <div>
                                        <h3 className="text-sm font-semibold text-blue-900">{course.title}</h3>
                                        <p className="text-xs text-gray-400 mt-1">{course.instructor}</p>
                                    </div>
                                </div>
                            </td>

                            <td className="p-4 text-center">
                                <span className={`inline-flex items-center justify-center px-3 py-1 text-xs font-medium rounded-full border ${
                                    course.status === 'Active'
                                        ? 'bg-green-50 text-green-600 border-green-300'
                                        : 'bg-yellow-50 text-yellow-600 border-yellow-300'
                                }`}>
                                    {course.status}
                                </span>
                            </td>

                            <td className="p-4 text-center text-sm text-gray-600">
                                {course.studentsCount}
                            </td>

                            <td className="p-4">
                                <div className="flex items-center justify-end gap-3">
                                    {course.status === 'Pending' && (
                                        <button
                                            onClick={() => onEditOrContinue(course.id)}
                                            className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-2 py-1 rounded hover:bg-blue-100 transition-colors font-medium whitespace-nowrap"
                                        >
                                            Continue course data
                                        </button>
                                    )}

                                    <button
                                        onClick={() => onEditOrContinue(course.id)}
                                        className="text-blue-500 hover:text-blue-700 transition-colors"
                                        title="Edit Course"
                                    >
                                        <Pencil size={18} />
                                    </button>
                                    <button
                                        onClick={() => onDelete(course.id)}
                                        className="text-red-500 hover:text-red-700 transition-colors"
                                        title="Delete Course"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}