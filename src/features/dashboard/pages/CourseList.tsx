import { useState } from 'react';
import { Plus } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import CourseTable from '../components/CourseTable';
import Pagination from '../components/Pagination';
import { useNavigate } from 'react-router-dom';
import { getCourseListDashboard } from '../api/courseApi';
import { useQuery } from '@tanstack/react-query';
import type { CourseApiResponse } from '../types';

export default function CourseListDashboard() {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);

    const { data, isLoading, isError } = useQuery<CourseApiResponse>({
        queryKey: ['courseListDashboard', currentPage],
        queryFn: () => getCourseListDashboard({ PageNumber: currentPage,PageSize:5 }), 
    });

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this course?')) {
            console.log(`Deleted course with ID: ${id}`);
        }
    };
    
    const handleEditOrContinue = (id: string) => {
        navigate(`/admin/edit-course/${id}`);
    };

    const courseItems = data?.courses?.items || [];
    const paginationData = data?.courses;

    return (
        <div className="flex min-h-screen bg-[#EAEAEA] font-sans">
            <Sidebar />

            <main className="flex-1 ml-64 p-8">
                <div className="bg-white rounded-xl shadow-sm p-8 min-h-[calc(100vh-4rem)] flex flex-col">

                    {/* Header Action */}
                    <div className="flex justify-end mb-6">
                        <button 
                            onClick={() => navigate('/admin/create-course')}  
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
                        >
                            <Plus size={18} />
                            Create Course
                        </button>
                    </div>

                    {/* Loading & Error States */}
                    {isLoading && <div className="text-center py-10">Loading courses...</div>}
                    {isError && <div className="text-center py-10 text-red-500">Error loading courses.</div>}

                    {/* Table */}
                    {!isLoading && !isError && (
                        <div className="flex-1">
                            <CourseTable
                                courses={courseItems}
                                onDelete={handleDelete}
                                onEditOrContinue={handleEditOrContinue}
                            />
                        </div>
                    )}

                    {/* Pagination */}
                    {!isLoading  && paginationData && paginationData.totalPages > 1 && (
                        <div className="mt-auto pt-6">
                            <Pagination 
                                currentPage={paginationData.pageNumber}
                                totalPages={paginationData.totalPages}
                                hasNextPage={paginationData.hasNextPage}
                                hasPreviousPage={paginationData.hasPreviousPage}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}