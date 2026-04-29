import { useState } from 'react';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import CourseTable from '../components/CourseTable';
import Pagination from '../components/Pagination';
import { useNavigate } from 'react-router-dom';
import { deleteCourse, getCourseListDashboard } from '../api/courseApi';
import { useQuery, keepPreviousData, useMutation, useQueryClient } from '@tanstack/react-query';

export default function CourseListDashboard() {
    const queryClient = useQueryClient()
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);

    const { data, isLoading, isError, isFetching } = useQuery({
        queryKey: ['courseListDashboard', currentPage],
        queryFn: () => getCourseListDashboard({ PageNumber: currentPage, PageSize: 5 }),
        placeholderData: keepPreviousData,
    });

    const { mutate } = useMutation({
        mutationFn: (id: string) => deleteCourse(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courseListDashboard'] })
        },
        onError: () => {
            toast.error('Failed to delete course. Please try again.');
        }
    });

    const handleDelete = (id: string) => {
        toast((t) => (
            <div className="flex flex-col gap-2">
                <p className="font-medium">Are you sure you want to delete this course?</p>
                <div className="flex gap-2 justify-end">
                    <button
                        onClick={() => {
                            mutate(id)
                            toast.dismiss(t.id);
                            toast.success('Course deleted successfully!');
                        }}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                        Delete
                    </button>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="px-3 py-1  dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        ), { duration: 2000 });
    };

    const handleEditOrContinue = (id: string) => {
        navigate(`/admin/create-course/${id}`);
    };

    const courseItems = data?.courses?.items || [];
    const paginationData = data?.courses;

    return (
        <div className="flex min-h-screen bg-[#EAEAEA] dark:bg-[#0e0e10] font-sans">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <div className="bg-white rounded-xl dark:bg-[#1A1A1A] shadow-sm p-8 min-h-[calc(100vh-4rem)] flex flex-col relative">

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

                    {/* Loading & Error States (Initial load only) */}
                    {isLoading && !data && <div className="text-center py-10 text-gray-500 dark:text-[#d0d0E0]">Loading courses...</div>}
                    {isError && <div className="text-center py-10 text-red-500">Error loading courses.</div>}

                    {/* Table */}
                    {courseItems.length > 0 && (
                        <div className={`flex-1 transition-opacity duration-200 ${isFetching ? 'opacity-50' : 'opacity-100'}`}>
                            <CourseTable
                                courses={courseItems}
                                onDelete={handleDelete}
                                onEditOrContinue={handleEditOrContinue}
                            />
                        </div>
                    )}

                    {/* Pagination */}
                    {paginationData && paginationData.totalPages > 1 && (
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