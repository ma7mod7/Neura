import { Routes, Route } from 'react-router-dom';
import LandingPage from './features/landing/pages/landingPage';
import LoginPage from './features/auth/pages/Login';
import SignupPage from './features/auth/pages/SignUp';
import AnnouncmentPage from './features/Announcment/pages/AnnouncmentPage';
import CoursesPage from './features/courses/pages/CoursesPage';
import SearchResultsPage from './features/courses/pages/SearchResultsPage';
import ConfirmEmail from './features/auth/pages/ConfirmEmail';
import VerifyEmail from './features/auth/pages/VerifyEmail';
import ForgotPasswordPage from './features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from './features/auth/pages/ResetPasswordPage';
import CourseDetailsPage from './features/courses/pages/CourseDetailsPage';
import ProfilePage from './features/Profile/pages/ProfilePage';
import ProtectedRoute from './features/auth/components/ProtectedRoute';
import ComingSoonPage from './shared/pages/ComingSoonPage';
import CreateCourse from './features/dashboard/pages/CreateCourse';
import CourseListDashboard from './features/dashboard/pages/CourseList';
import StudentList from './features/dashboard/pages/StudentList';
import ProfileEditPage from './features/Profile/pages/ProfileEdit';
import { ThemeProvider } from "./shared/context/ThemeContext";



function App() {
  return (
    <ThemeProvider>
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/signup" element={<SignupPage />} />
      <Route path="/auth/confirm-email" element={<ConfirmEmail />} />
      <Route path="/auth/verify-email" element={<VerifyEmail />} />
      <Route path="/auth/forget-password" element={<ForgotPasswordPage />} />
      <Route path="auth/reset-password" element={<ResetPasswordPage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/announcements" element={<AnnouncmentPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:courseId" element={<CourseDetailsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/edit" element={<ProfileEditPage />} />
        <Route path="/search-results" element={<SearchResultsPage />} />
        { /* Admin Routes */}
        <Route path="/admin/course-list" element={<CourseListDashboard />} />
        <Route path="/admin/create-course" element={<CreateCourse />} />
        <Route path="/admin/students" element={<StudentList />} />

      </Route>

      {/* Fallback route - Redirect any unknown path to home */}
      <Route path="*" element={<ComingSoonPage />} />
      {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
    </Routes>
     </ThemeProvider>
  );
}

export default App;