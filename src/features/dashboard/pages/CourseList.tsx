import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { Course } from '../types';
import Sidebar from '../components/Sidebar';
import CourseTable from '../components/CourseTable';
import Pagination from '../components/Pagination';
import { useNavigate } from 'react-router-dom';

// --- Mock Data ---
const mockCourses: Course[] = [
    { id: '1', title: 'Complete Machine Learning & Data Science Bootcamp', instructor: 'Dr. Angela Yu', image: 'https://via.placeholder.com/50', status: 'Pending', studentsCount: '425,890' },
    { id: '2', title: 'Complete Machine Learning & Data Science Bootcamp', instructor: 'Dr. Angela Yu', image: 'https://via.placeholder.com/50', status: 'Active', studentsCount: '425,890' },
    { id: '3', title: 'Complete Machine Learning & Data Science Bootcamp', instructor: 'Dr. Angela Yu', image: 'https://via.placeholder.com/50', status: 'Active', studentsCount: '425,890' },
    { id: '4', title: 'Complete Machine Learning & Data Science Bootcamp', instructor: 'Dr. Angela Yu', image: 'https://via.placeholder.com/50', status: 'Pending', studentsCount: '425,890' },
    { id: '5', title: 'Complete Machine Learning & Data Science Bootcamp', instructor: 'Dr. Angela Yu', image: 'https://via.placeholder.com/50', status: 'Active', studentsCount: '425,890' },
    { id: '6', title: 'Complete Machine Learning & Data Science Bootcamp', instructor: 'Dr. Angela Yu', image: 'https://via.placeholder.com/50', status: 'Pending', studentsCount: '425,890' },
];

export default function CourseListDashboard() {
    const [courses, setCourses] = useState<Course[]>(mockCourses);
    const navigate = useNavigate();

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this course?')) {
            setCourses(courses.filter(course => course.id !== id));
        }
    };

    const handleEditOrContinue = (id: string) => {
        console.log(`Maps to edit/continue course data for ID: ${id}`);
        alert(`سيتم تحويلك لصفحة إكمال/تعديل بيانات الكورس رقم: ${id}`);
    };

    return (
        <div className="flex min-h-screen bg-[#EAEAEA] font-sans">
            <Sidebar />

            <main className="flex-1 ml-64 p-8">
                <div className="bg-white rounded-xl shadow-sm p-8 min-h-[calc(100vh-4rem)]">

                    {/* Header Action */}
                    <div className="flex justify-end mb-6">
                        <button onClick={() => navigate('/admin/create-course')}  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors">
                            <Plus size={18} />
                            Create Course
                        </button>
                    </div>

                    <CourseTable
                        courses={courses}
                        onDelete={handleDelete}
                        onEditOrContinue={handleEditOrContinue}
                    />

                    <Pagination />
                </div>
            </main>
        </div>
    );
}