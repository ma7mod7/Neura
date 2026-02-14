import { Bell, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProfileMenu from './ProfileMenu';
import Course from '../../assets/course.png';
import { useState } from 'react';
import Logo from '../../assets/logo.jpg'


const NavBar = () => {
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
    const navLinks = [
        { name: 'Home', path: '/', active: false, action: () => navigate('/announcements') },
        { name: 'Courses', path: '/courses', active: false, action: () => navigate('/courses') },
        { name: 'Problems', path: '#', active: false },
        { name: 'Community', path: '#', active: false },
        { name: 'Resources', path: '#', active: false },
    ];


    return (
        <nav className="sticky top-0 z-50 bg-white border-b border-slate-100 px-4 py-2">
            <div className="relative max-w-[1440px] mx-auto flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <img src={Logo} alt="" className="h-12 rounded-full w-auto object-contain" />
                    <span className="text-blue-600 font-black text-xl tracking-tighter">Neura</span>
                </div>
                {/* Desktop Navigation (Hidden on Mobile) */}
                <div className="flex items-center gap-8">
                    <div className="hidden md:flex items-center gap-6 text-slate-600 font-medium text-sm">
                        {navLinks.map((link, index) => (
                            <button
                                key={index}
                                onClick={link.action}
                                className={`hover:text-blue-600 transition-colors text-blue-600' `}
                            >
                                {link.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center gap-3 sm:gap-4">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors relative">
                        <Bell size={22} />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>

                    {/* Profile Picture */}
                    <div className="relative">
                        <button onClick={handleOpenProfileMenu}>
                            <img src={Course} className="w-10 h-10 rounded-full border-2 border-[#0061EF] cursor-pointer object-cover p-0.5 " alt="profile" />
                        </button>
                        {isOpenProfileMenu && (
                            <ProfileMenu setIsOpen={setIsOpenProfileMenu} />
                        )}
                    </div>

                    {/* 3. Hamburger Menu Button (Visible only on Mobile) */}
                    <button
                        className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        onClick={toggleMobileMenu}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>


            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-100 shadow-xl z-40 animate-in slide-in-from-top-5 duration-200">
                    <div className="flex flex-col p-4 space-y-2">
                        {navLinks.map((link, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    if (link.action) link.action();
                                    setIsMobileMenuOpen(false);
                                }}
                                className={`text-left px-4 py-3 rounded-xl font-medium transition-all 
                                        ${link.name === 'Home'
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
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