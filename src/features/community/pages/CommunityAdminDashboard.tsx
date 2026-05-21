import  { useState } from 'react';
import {
    Shield, Server, Users, MessageSquare, AlertTriangle,
    MoreVertical, Edit, Trash2, Plus, Search
} from 'lucide-react';
// ⭐ استدعاء السايدبار المخصص لإدارة المجتمع
import CommunityAdminSidebar from '../components/CommunityAdminSidebar'; 

// --- MOCK DATA ---
const MOCK_SPACES_ADMIN = [
    { id: '1', name: 'Frontend Bootcamp', channels: 5, members: 120, status: 'Active' },
    { id: '2', name: 'Backend Masters', channels: 3, members: 85, status: 'Active' },
    { id: '3', name: 'Teachers Lounge', channels: 2, members: 12, status: 'Private' },
];

export default function CommunityAdminDashboard() {
    const [activeTab, setActiveTab] = useState<'spaces' | 'moderation'>('spaces');

    return (
        <div className="flex min-h-screen bg-[#EAEAEA] dark:bg-[#0e0e10] font-sans">

            {/* ⭐ السايدبار الجديد المخصص للمجتمع */}
            <CommunityAdminSidebar />

            {/* ⭐ الـ Layout سيعمل هنا بامتياز لأن السايدبار أعلاه ثابت وعرضه 64 */}
            <main className="flex-1 ms-64 p-8 overflow-y-auto">

                {/* Page Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
                            Overview
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your community spaces and monitor activity.</p>
                    </div>

                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md">
                        <Plus size={18} /> Create New Space
                    </button>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {[
                        { label: 'Total Spaces', value: '14', icon: <Server size={24} className="text-blue-500" />, bg: 'bg-blue-100 dark:bg-blue-500/20' },
                        { label: 'Active Members', value: '1,240', icon: <Users size={24} className="text-green-500" />, bg: 'bg-green-100 dark:bg-green-500/20' },
                        { label: 'Messages Today', value: '8.4k', icon: <MessageSquare size={24} className="text-purple-500" />, bg: 'bg-purple-100 dark:bg-purple-500/20' },
                        { label: 'Flagged Content', value: '23', icon: <AlertTriangle size={24} className="text-red-500" />, bg: 'bg-red-100 dark:bg-red-500/20' },
                    ].map((stat, idx) => (
                        <div key={idx} className="bg-white dark:bg-[#1c1c1f] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-[#2a2a2e] flex items-center gap-4 hover:shadow-md transition-shadow">
                            <div className={`p-4 rounded-xl ${stat.bg}`}>{stat.icon}</div>
                            <div>
                                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{stat.label}</p>
                                <p className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tabs for quick access on Overview page */}
                <div className="flex gap-6 border-b border-slate-200 dark:border-[#2a2a2e] mb-6">
                    <button
                        onClick={() => setActiveTab('spaces')}
                        className={`flex items-center gap-2 pb-3 px-1 text-sm font-bold transition-all border-b-2 ${activeTab === 'spaces' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
                    >
                        <Server size={18} /> Quick Manage Spaces
                    </button>
                    <button
                        onClick={() => setActiveTab('moderation')}
                        className={`flex items-center gap-2 pb-3 px-1 text-sm font-bold transition-all border-b-2 ${activeTab === 'moderation' ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
                    >
                        <Shield size={18} /> Recent Alerts
                    </button>
                </div>

                {/* Tab Content: Spaces */}
                {activeTab === 'spaces' && (
                    <div className="bg-white dark:bg-[#1c1c1f] rounded-2xl shadow-sm border border-slate-100 dark:border-[#2a2a2e] overflow-hidden">
                        <div className="p-5 border-b border-slate-100 dark:border-[#2a2a2e] flex justify-between items-center bg-slate-50/50 dark:bg-[#161619]">
                            <div className="relative w-72">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <input type="text" placeholder="Search spaces..." className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#0e0e10] border border-slate-200 dark:border-[#3a3a3e] rounded-lg text-sm outline-none focus:border-blue-500 dark:text-white" />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-[#161619] text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                                        <th className="p-4 font-bold">Space Name</th>
                                        <th className="p-4 font-bold">Channels</th>
                                        <th className="p-4 font-bold">Members</th>
                                        <th className="p-4 font-bold">Status</th>
                                        <th className="p-4 font-bold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-[#2a2a2e]">
                                    {MOCK_SPACES_ADMIN.map((space) => (
                                        <tr key={space.id} className="hover:bg-slate-50/50 dark:hover:bg-[#2a2a2e]/50 transition-colors">
                                            <td className="p-4 flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg">
                                                    {space.name.charAt(0)}
                                                </div>
                                                <span className="font-bold text-slate-900 dark:text-white">{space.name}</span>
                                            </td>
                                            <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">{space.channels}</td>
                                            <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">{space.members}</td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${space.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-slate-100 text-slate-700 dark:bg-[#3a3a3e] dark:text-slate-300'}`}>
                                                    {space.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"><Edit size={16} /></button>
                                                    <button className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                                    <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#3a3a3e] rounded-lg transition-colors"><MoreVertical size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Tab Content: Moderation */}
                {activeTab === 'moderation' && (
                    <div className="bg-white dark:bg-[#1c1c1f] p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-[#2a2a2e] text-center">
                        <Shield className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Queue is Clean</h3>
                        <p className="text-slate-500 dark:text-slate-400">No reported messages or flagged content at the moment.</p>
                    </div>
                )}

            </main>
        </div>
    );
}