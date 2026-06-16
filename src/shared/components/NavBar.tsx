import { Menu, X } from 'lucide-react';
import { useNavigate,useLocation } from 'react-router-dom';
import ProfileMenu from './ProfileMenu';
import { useState } from 'react';
import Logo from '../../assets/logo.png'
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { hasAdminRole, hasInstructorRole } from '../../utils/jwt';


const NavBar = () => {

    const { token } = useAuth();
    const isAdmin = hasAdminRole(token);
    const isInstructor = hasInstructorRole(token);
    const canAccessDashboard = isAdmin || isInstructor;
    const { t, i18n } = useTranslation();
    const toggleLanguage = () => {
        const newLang = i18n.resolvedLanguage === 'ar' ? 'en' : 'ar';
        i18n.changeLanguage(newLang);
    };

    const [isOpenProfileMenu, setIsOpenProfileMenu] = useState<boolean>(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

    const handleOpenProfileMenu = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsOpenProfileMenu(!isOpenProfileMenu);
    }

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
        if (isOpenProfileMenu) setIsOpenProfileMenu(false);
    }
    const navigate = useNavigate();
    const location = useLocation();
    const navLinks = [
    { name: t('navigation.home'), path: '/', active: false, action: () => navigate('/announcements') },
    { name: t('navigation.courses'), path: '/courses', active: false, action: () => navigate('/courses') },
    { name: t('navigation.community'), path: '/community', active: false, action: () => navigate('/community/students') },
    // Hide "Become an Instructor" if already instructor or admin
    ...(!canAccessDashboard ? [{ name: 'Become an Instructor', path: '/instructor/apply', active: false, action: () => navigate('/instructor/apply') }] : []),
    // Only pure admins see Applications in navbar
    ...(isAdmin ? [{ name: 'Applications', path: '/dashboard/instructor-applications', active: false, action: () => navigate('/dashboard/instructor-applications') }] : []),
 ];
    const dataLogin = useAuth()


    return (
        <nav className="sticky top-0 z-50 bg-white border-b border-slate-100  dark:bg-[#0e0e10]/70 dark:backdrop-blur-md dark:border-[#1c1c1f] px-4 py-2">
            <div className="relative max-w-[1440px] mx-auto flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <img src={Logo} alt="" className="h-12 rounded-full w-auto object-contain" />
                    <span className="text-blue-600 font-black text-xl tracking-tighter">Neura</span>
                </div>
                {/* Desktop Navigation (Hidden on Mobile) */}
                <div className="flex items-center gap-8">
                    <div className="hidden md:flex items-center gap-6 text-slate-600 dark:text-slate-300 font-medium text-sm">
                        {navLinks.map((link, index) => {
                                const isActive =
                                    (link.path === '/' && location.pathname === '/announcements') ||
                                    (link.path !== '/' && location.pathname.startsWith(link.path));

                                return (
                                    <button
                                        key={index}
                                        onClick={link.action}
                                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                                            isActive
                                                ? 'bg-blue-50 text-[#0061EF] dark:bg-blue-500/10 dark:text-blue-400'
                                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1c1c1f] hover:text-[#0061EF] dark:hover:text-blue-400'
                                        }`}
                                    >
                                        {link.name}
                                    </button>
                                );
                            })}
                    </div>
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center gap-3 sm:gap-4">

                    {/* <button className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-[#1c1c1f] rounded-full transition-colors relative">
                        <Bell size={22} />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#0e0e10]"></span>
                    </button> */}

                    <button 
                        onClick={toggleLanguage}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-[#1c1c1f] text-slate-600 dark:text-slate-300 transition-colors font-medium text-sm"
                    >
                        <Globe size={18} />
                        <span className="hidden sm:inline">{t('navigation.languageToggle')}</span>
                    </button>

                    {/* Profile Picture */}
                    <div className="relative">
                        <button onClick={handleOpenProfileMenu}>
                            <img src={dataLogin.user?.imageUrl} className="w-10 h-10 rounded-full border-2 border-[#0061EF] cursor-pointer object-cover p-0.5 " alt="profile" />
                        </button>
                        {isOpenProfileMenu && (
                            <ProfileMenu setIsOpen={setIsOpenProfileMenu} />
                        )}
                    </div>

                    {/* 3. Hamburger Menu Button (Visible only on Mobile) */}
                    <button
                        className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1c1c1f] rounded-lg transition-colors"
                        onClick={toggleMobileMenu}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>


            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-full inset-x-0 w-full bg-white dark:bg-[#0e0e10] border-b border-slate-100 dark:border-[#1c1c1f] shadow-xl z-40 animate-in slide-in-from-top-5 duration-200">
                    <div className="flex flex-col p-4 space-y-2">
                        {navLinks.map((link, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    if (link.action) link.action();
                                    setIsMobileMenuOpen(false);
                                }}
                                className={`text-start px-4 py-3 rounded-xl font-medium transition-all 
                                       ${(
                                                (link.path === '/' && location.pathname === '/announcements') ||
                                                (link.path !== '/' && location.pathname.startsWith(link.path))
                                        )
                                            ? 'bg-blue-50 dark:bg-[#1c1c1f] text-blue-600'
                                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1c1c1f] hover:text-slate-900 dark:hover:text-white'
                                    }`}
                            >
                                {link.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    )
}

export default NavBar
