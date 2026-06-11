import { Shield, Search } from 'lucide-react';
import { useState } from 'react';
import type { CourseMemberDto } from '../types/communityTypes';

interface MembersListProps {
    members: CourseMemberDto[];
    loading?: boolean;
}

const statusColor = (isOnline: boolean, role?: string | null) => {
    console.log(role)
    if (!isOnline) return 'bg-slate-400 dark:bg-slate-600';
    return 'bg-green-500';
};

export default function MembersList({ members, loading }: MembersListProps) {
    const [query, setQuery] = useState('');
    const filtered = members.filter(m =>
        (m.displayName ?? '').toLowerCase().includes(query.toLowerCase())
    );
    const admins = filtered.filter(m => m.roleName === 'admin' || m.roleName === 'instructor');
    const onlineStudents = filtered.filter(m => m.roleName !== 'admin' && m.roleName !== 'instructor' && m.isOnline);
    const offlineMembers = filtered.filter(m => !m.isOnline && m.roleName !== 'admin' && m.roleName !== 'instructor');
    const MemberRow = ({ member }: { member: CourseMemberDto }) => (
        <div className="flex items-center gap-3 p-2 hover:bg-slate-200 dark:hover:bg-[#2a2a2e] rounded-md cursor-pointer transition-colors group">
            <div className="relative flex-shrink-0">
                <img
                    src={member.avatarUrl ?? `https://ui-avatars.com/api/?name=${member.displayName}`}
                    className={`w-8 h-8 rounded-full ${!member.isOnline ? 'grayscale opacity-60' : ''}`}
                    alt={member.displayName ?? ''}
                />
                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-slate-50 dark:border-[#1c1c1f] group-hover:border-slate-200 dark:group-hover:border-[#2a2a2e] rounded-full ${statusColor(member.isOnline)}`} />
            </div>
            <span className={`font-medium text-sm truncate ${
                member.roleName === 'admin' || member.roleName === 'instructor'
                    ? 'text-amber-600 dark:text-amber-400'
                    : member.isOnline
                        ? 'text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white'
                        : 'text-slate-400 dark:text-slate-500'
            }`}>
                {member.displayName}
            </span>
            {(member.roleName === 'admin' || member.roleName === 'instructor') && (
                <Shield size={11} className="text-amber-500 ml-auto flex-shrink-0" />
            )}
        </div>
    );

    if (loading) {
        return (
            <div className="flex-1 p-4 space-y-2">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 animate-pulse">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-[#2a2a2e]" />
                        <div className="h-3 w-24 bg-slate-200 dark:bg-[#2a2a2e] rounded" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="w-60 flex-shrink-0 bg-slate-50 dark:bg-[#1c1c1f] border-l border-slate-200 dark:border-[#2a2a2e] flex flex-col z-10">
                <div className="p-3 border-b border-slate-200 dark:border-[#2a2a2e]">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Search members"
                            className="w-full bg-slate-100 dark:bg-[#2a2a2e] text-sm rounded-md pl-8 pr-2 py-1.5 outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white"
                        />
                    </div>
                </div>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-6">

                {admins.length > 0 && (
                    <section>
                        <h3 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                            Instructors — {admins.length}
                        </h3>
                        <div className="space-y-0.5">
                            {admins.map(m => <MemberRow key={m.userId} member={m} />)}
                        </div>
                    </section>
                )}

                {onlineStudents.length > 0 && (
                    <section>
                        <h3 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                            Online — {onlineStudents.length}
                        </h3>
                        <div className="space-y-0.5">
                            {onlineStudents.map(m => <MemberRow key={m.userId} member={m} />)}
                        </div>
                    </section>
                )}

                {offlineMembers.length > 0 && (
                    <section>
                        <h3 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                            Offline — {offlineMembers.length}
                        </h3>
                        <div className="space-y-0.5">
                            {offlineMembers.map(m => <MemberRow key={m.userId} member={m} />)}
                        </div>
                    </section>
                )}

            </div>
        </div>
    );
}