import  { useState } from 'react';
import { Search, Trash2, Snowflake, Unlock, ChevronLeft, ChevronRight } from 'lucide-react';
import Sidebar from '../components/Sidebar';

// --- Types ---
type StudentStatus = 'Active' | 'Frozen';

interface Student {
    id: string;
    name: string;
    email: string;
    avatar: string;
    enrolledCourses: number;
    joinDate: string;
    status: StudentStatus;
}

// --- Mock Data ---
const mockStudents: Student[] = [
    { id: '1', name: 'Ahmed Mohamed', email: 'ahmed@example.com', avatar: 'https://i.pravatar.cc/150?u=1', enrolledCourses: 4, joinDate: '12 Oct 2025', status: 'Active' },
    { id: '2', name: 'Sara Ali', email: 'sara.ali@example.com', avatar: 'https://i.pravatar.cc/150?u=2', enrolledCourses: 2, joinDate: '15 Oct 2025', status: 'Frozen' },
    { id: '3', name: 'Omar Khaled', email: 'omar.k@example.com', avatar: 'https://i.pravatar.cc/150?u=3', enrolledCourses: 5, joinDate: '01 Nov 2025', status: 'Active' },
    { id: '4', name: 'Mona Hassan', email: 'mona.h@example.com', avatar: 'https://i.pravatar.cc/150?u=4', enrolledCourses: 1, joinDate: '20 Nov 2025', status: 'Active' },
    { id: '5', name: 'Kareem Youssef', email: 'kareem.y@example.com', avatar: 'https://i.pravatar.cc/150?u=5', enrolledCourses: 3, joinDate: '05 Dec 2025', status: 'Frozen' },
    { id: '6', name: 'Nour Tariq', email: 'nour.t@example.com', avatar: 'https://i.pravatar.cc/150?u=6', enrolledCourses: 6, joinDate: '10 Dec 2025', status: 'Active' },
];

export default function StudentList() {
    const [students, setStudents] = useState<Student[]>(mockStudents);
    const [searchTerm, setSearchTerm] = useState('');

    // ================= Handlers =================

    // دالة الحذف
    const handleDelete = (id: string) => {
            setStudents(students.filter(student => student.id !== id));
            // هنا تضع كود الـ API (axios.delete)
        
    };

    // دالة تجميد / فك تجميد الحساب
    const handleToggleFreeze = (id: string, currentStatus: StudentStatus) => {
        const newStatus = currentStatus === 'Active' ? 'Frozen' : 'Active';
        const actionText = currentStatus === 'Active' ? 'freeze' : 'unfreeze';
        
        if (window.confirm(`Are you sure you want to ${actionText} this account?`)) {
            setStudents(students.map(student => 
                student.id === id ? { ...student, status: newStatus } : student
            ));
            // هنا تضع كود الـ API (axios.put/patch)
        }
    };

    // فلترة الطلاب بناءً على البحث
    const filteredStudents = students.filter(student => 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex min-h-screen bg-[#EAEAEA] font-sans">
            {/* القائمة الجانبية */}
            <Sidebar />

            {/* المحتوى الرئيسي */}
            <main className="flex-1 ml-64 p-8">
                <div className="bg-white rounded-xl shadow-sm p-8 min-h-[calc(100vh-4rem)] flex flex-col">
                    
                    {/* ====== Header & Search ====== */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Students Management</h1>
                            <p className="text-sm text-gray-500 mt-1">Manage enrolled students, freeze accounts, or remove them.</p>
                        </div>

                        {/* Search Bar */}
                        <div className="relative w-full md:w-80">
                            <input 
                                type="text" 
                                placeholder="Search by name or email..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                            />
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        </div>
                    </div>

                    {/* ====== Table ====== */}
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-blue-600 text-white text-left text-sm font-medium">
                                    <th className="p-4 rounded-tl-lg w-2/5">Student</th>
                                    <th className="p-4 w-1/6 text-center">Enrolled Courses</th>
                                    <th className="p-4 w-1/6 text-center">Join Date</th>
                                    <th className="p-4 w-1/6 text-center">Status</th>
                                    <th className="p-4 rounded-tr-lg w-1/6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.length > 0 ? (
                                    filteredStudents.map((student, index) => (
                                        <tr 
                                            key={student.id} 
                                            className={`border-b border-transparent hover:bg-blue-50/50 transition-colors ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                                        >
                                            {/* Student Info */}
                                            <td className="p-4">
                                                <div className="flex items-center gap-4">
                                                    <img 
                                                        src={student.avatar} 
                                                        alt={student.name} 
                                                        className="w-10 h-10 rounded-full border border-gray-200 object-cover"
                                                    />
                                                    <div>
                                                        <h3 className="text-sm font-semibold text-blue-900">{student.name}</h3>
                                                        <p className="text-xs text-gray-500 mt-0.5">{student.email}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Enrolled Courses */}
                                            <td className="p-4 text-center text-sm font-medium text-gray-700">
                                                {student.enrolledCourses}
                                            </td>

                                            {/* Join Date */}
                                            <td className="p-4 text-center text-sm text-gray-500">
                                                {student.joinDate}
                                            </td>

                                            {/* Status Badge */}
                                            <td className="p-4 text-center">
                                                <span className={`inline-flex items-center justify-center px-3 py-1 text-xs font-medium rounded-full border ${
                                                    student.status === 'Active' 
                                                        ? 'bg-green-50 text-green-600 border-green-300' 
                                                        : 'bg-slate-100 text-slate-600 border-slate-300'
                                                }`}>
                                                    {student.status}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="p-4">
                                                <div className="flex items-center justify-end gap-3">
                                                    {/* Freeze / Unfreeze Button */}
                                                    <button 
                                                        onClick={() => handleToggleFreeze(student.id, student.status)}
                                                        className={`p-1.5 rounded transition-colors ${
                                                            student.status === 'Active' 
                                                            ? 'text-blue-500 hover:bg-blue-100' 
                                                            : 'text-green-600 hover:bg-green-100'
                                                        }`}
                                                        title={student.status === 'Active' ? 'Freeze Account' : 'Unfreeze Account'}
                                                    >
                                                        {student.status === 'Active' ? <Snowflake size={18} /> : <Unlock size={18} />}
                                                    </button>

                                                    {/* Delete Button */}
                                                    <button 
                                                        onClick={() => handleDelete(student.id)}
                                                        className="p-1.5 text-red-500 hover:bg-red-100 rounded transition-colors"
                                                        title="Delete Student"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-gray-500">
                                            No students found matching your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* ====== Pagination ====== */}
                    <div className="flex items-center justify-between mt-8 border-t border-gray-100 pt-6">
                        <span className="text-sm text-gray-500">
                            Showing {filteredStudents.length} of {students.length} students
                        </span>
                        
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                            <button className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                                <ChevronLeft size={16} />
                            </button>
                            <button className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded">1</button>
                            <button className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded text-gray-800">2</button>
                            <button className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded">3</button>
                            <button className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}