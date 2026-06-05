import React from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { getTokenRoles } from '../../../utils/jwt'; 
import { StudentAnalysis }    from './StudentAnalysis';
import { InstructorAnalysis } from './InstructorAnalysis';

const INSTRUCTOR_ROLES = new Set(['instructor', 'admin', 'superadmin', 'super-admin', 'Instructor', 'Admin']);

const AnalysisPage: React.FC = () => {
  const { user, token } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f4f6fa] dark:bg-[#0e0e10] flex items-center justify-center">
        
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  const roles = getTokenRoles(token);
  const isInstructor = roles.some((r) => INSTRUCTOR_ROLES.has(r));

  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
    || user.userName
    || user.email
    || 'User';

  if (isInstructor) {
    return <InstructorAnalysis userName={displayName} />;
  }

  return <StudentAnalysis userName={displayName} />;
};

export default AnalysisPage;