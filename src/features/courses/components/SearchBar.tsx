import {  Home, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ProfileMenu from '../../../shared/components/ProfileMenu';
import Logo from '../../../assets/logo.png'
import { useAuth } from '../../auth/hooks/useAuth';
import { useTranslation } from 'react-i18next';

const mockSuggestions = [
    { id: '1', type: 'course', name: 'Machine Learning Bootcamp' },
    { id: '2', type: 'course', name: 'Deep Learning with Python' },
    { id: '3', type: 'course', name: 'Artificial Intelligence' },
    { id: '4', type: 'course', name: 'Data Science' },
    { id: '5', type: 'course', name: 'Python for AI' },
];

export const SearchBar = () => {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<typeof mockSuggestions>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const [isOpenProfileMenu, setIsOpenProfileMenu] = useState<boolean>(false);

    const navigate = useNavigate();
    const location = useLocation(); // ⭐ استخدمنا useLocation لمعرفة الصفحة الحالية

    // ⭐ مصفوفة الروابط التي طلبتها (تم وضعها داخل المكون لتتمكن من استخدام navigate)
    const navLinks = [
        { name: t('navigation.home'), path: '/announcements', action: () => navigate('/announcements') },
        { name: t('navigation.courses'), path: '/courses', action: () => navigate('/courses') },
        { name: t('navigation.community'), path: '/community', action: () => navigate('/community/students') },
    ];

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);

        if (value.trim().length < 2) {
            setSuggestions([]);
            setIsDropdownOpen(false);
            return;
        }

        const filtered = mockSuggestions.filter(item =>
            item.name.toLowerCase().includes(value.toLowerCase())
        );

        setSuggestions(filtered);
        setIsDropdownOpen(true);
    };

    const handleSelectSuggestion = (item: any) => {
        setIsDropdownOpen(false);
        setSearchQuery(item.name);
        navigate(`/search-results?query=${encodeURIComponent(item.name)}`);
    };

    const handleOpenProfileMenu = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsOpenProfileMenu(!isOpenProfileMenu);
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                searchRef.current &&
                !searchRef.current.contains(event.target as Node)
            ) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);
    const {user}=useAuth()
    return (
        <div>
            <nav className="sticky top-0 z-50 bg-white dark:bg-[#0e0e10]/70 dark:backdrop-blur-md border-b border-slate-100 dark:border-[#1c1c1f] px-4 py-3 shadow-md">
                <div className="max-w-[1450px] mx-auto flex items-center justify-between gap-4 md:gap-8">
                    
                    {/* ⭐ الجزء الخاص باللوجو والروابط (Nav Links) */}
                    <div className="flex items-center gap-8 shrink-0">
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/announcements')}>
                            <img src={Logo} alt="Neura Logo" className="h-12 rounded-full w-auto object-contain" />
                            <span className="text-xl font-bold tracking-tight text-[#0061EF] hidden sm:block">NEURA</span>
                        </div>

                        {/* ⭐ عرض الروابط في الشاشات الكبيرة */}
                        <div className="hidden lg:flex items-center gap-2">
                            {navLinks.map((link) => {
                                // تحديد ما إذا كان الرابط نشطاً لتمييزه بصرياً
                                const isActive = location.pathname.includes(link.path);
                                return (
                                    <button
                                        key={link.name}
                                        onClick={link.action}
                                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                                            isActive 
                                            ? 'bg-blue-50 dark:bg-blue-500/10 text-[#0061EF] dark:text-blue-400' 
                                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1c1c1f] hover:text-[#0061EF] dark:hover:text-blue-400'
                                        }`}
                                    >
                                        {link.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div ref={searchRef} className="flex-1 max-w-2xl relative">
                        <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            placeholder={t('navigation.searchPlaceholder')}
                            className="w-full bg-slate-50 dark:bg-[#1c1c1f] dark:text-white dark:placeholder:text-slate-500 rounded-xl py-2.5 ps-12 pe-4 outline-none border border-slate-200 dark:border-[#2a2a2e] focus:ring-2 ring-[#0061EF] focus:bg-white dark:focus:bg-[#2a2a2e] transition-all text-sm"
                        />
                        {isDropdownOpen && suggestions.length > 0 && (
                            <div className="absolute top-full inset-x-0 mt-2 bg-white dark:bg-[#1c1c1f] border border-slate-200 dark:border-[#2a2a2e] rounded-xl shadow-lg z-50 overflow-hidden">
                                {suggestions.map((item) => (
                                    <button
                                        type="button"
                                        key={item.id}
                                        onClick={(e) => { e.preventDefault(); handleSelectSuggestion(item); }}
                                        className="w-full text-start px-4 py-3 hover:bg-slate-100 dark:hover:bg-[#2a2a2e] text-sm text-slate-800 dark:text-slate-200 transition-colors"
                                    >
                                        <span className="font-medium">{item.name}</span>
                                        <span className="ms-2 text-xs text-slate-400 dark:text-slate-500">
                                            {item.type}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-3 md:gap-5 relative">
                        {/* إخفاء أيقونة الهوم في الشاشات الكبيرة لأنها موجودة ككلمة في الروابط الآن */}
                        <button onClick={() => navigate('/announcements')} className="p-2 text-slate-600 dark:text-slate-400 hover:text-[#0061EF] dark:hover:text-[#0061EF] transition-colors lg:hidden">
                            <Home size={22} />
                        </button>
                        
                        
                        
                        <button onClick={handleOpenProfileMenu}>
                            <img src={user?.imageUrl} className="w-10 h-10 rounded-full border-2 border-[#0061EF] cursor-pointer object-cover p-0.5 " alt="Profile" />
                        </button>
                        {isOpenProfileMenu && (
                            <ProfileMenu setIsOpen={setIsOpenProfileMenu} />
                        )}
                    </div>
                </div>
            </nav>
        </div>
    )
}
