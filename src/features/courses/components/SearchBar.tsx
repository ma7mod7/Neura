
import { Bell, Home, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileMenu from '../../../shared/components/ProfileMenu';
import Logo from '../../../assets/logo.jpg'

const mockSuggestions = [
    { id: '1', type: 'course', name: 'Machine Learning Bootcamp' },
    { id: '2', type: 'course', name: 'Deep Learning with Python' },
    { id: '3', type: 'course', name: 'Artificial Intelligence' },
    { id: '4', type: 'course', name: 'Data Science' },
    { id: '5', type: 'course', name: 'Python for AI' },
];

export const SearchBar = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<typeof mockSuggestions>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const [isOpenProfileMenu, setIsOpenProfileMenu] = useState<boolean>(false);

    const navigate = useNavigate();

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


    return (
        <div>
            <nav className="sticky top-0 z-50 bg-white border-b border-slate-100 px-4 py-3 shadow-md">
                <div className="max-w-[1450px] mx-auto flex items-center justify-between gap-4 md:gap-8">
                    <div className="flex items-center gap-2 shrink-0">
                        <img src={Logo} alt="" className="h-12 rounded-full w-auto object-contain" />

                        <span className="text-xl font-bold tracking-tight text-[#0061EF] hidden sm:block">NEURA</span>
                    </div>

                    <div ref={searchRef} className="flex-1 max-w-2xl relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            placeholder="Search for anything"
                            className="w-full bg-slate-50 rounded-xl py-2.5 pl-12 pr-4 outline-none border border-slate-200 focus:ring-2 ring-[#0061EF] focus:bg-white transition-all text-sm"
                        />
                    </div>
                    {isDropdownOpen && suggestions.length > 0 && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 ml-9 w-[800px] bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
                            {suggestions.map((item) => (
                                <button
                                    type="button"
                                    key={item.id}
                                    onClick={(e) => { e.preventDefault(); handleSelectSuggestion(item); }}
                                    className="w-full text-left px-4 py-3 hover:bg-slate-100 text-sm"
                                >
                                    <span className="font-medium">{item.name}</span>
                                    <span className="ml-2 text-xs text-slate-400">
                                        {item.type}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                    {/* --- Suggestions Dropdown --- */}
                    <div className="flex items-center gap-3 md:gap-5 relative">
                        <button onClick={() => navigate('/announcements')} className="p-2 text-slate-600 hover:text-[#0061EF] transition-colors">
                            <Home size={22} />
                        </button>
                        <button className="p-2 text-slate-600 hover:text-[#0061EF] transition-colors relative">
                            <Bell size={22} />
                            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <button onClick={handleOpenProfileMenu}>
                            <img src="https://avatar.iran.liara.run/public/30" className="w-10 h-10 rounded-full border-2 border-[#0061EF] cursor-pointer object-cover p-0.5 " alt="Profile" />
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
