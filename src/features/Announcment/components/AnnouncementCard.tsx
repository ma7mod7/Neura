import { EllipsisVertical, Heart, MessageSquare, Pencil, Trash2 } from "lucide-react";
import Course from '../../../assets/course.png';
import { useEffect, useRef, useState } from "react";

const AnnouncementCard = ({ hasImage = false }) => {
    const [isOpenPostCardSetting, setIsOpenPostCardSetting] = useState<boolean>(false);
    const PostCardSettingRef = useRef<HTMLDivElement>(null);

    const handleOpenPostCardSetting = () => {
        
        setIsOpenPostCardSetting(!isOpenPostCardSetting);
    }
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                PostCardSettingRef.current &&
                !PostCardSettingRef.current.contains(event.target as Node)
            ) {
                setIsOpenPostCardSetting(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);
    return (
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6 border border-slate-200 relative">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <img
                        src={Course}
                        alt="Avatar"
                        className="w-12 h-12 rounded-full border-2 border-blue-500 p-0.5"
                    />
                    <div>
                        <h3 className="font-bold text-slate-900 text-sm">Mahmoud Emad</h3>
                        <p className="text-slate-500 text-xs flex items-center gap-2">
                            Vice Leader <span className="w-1 h-1 bg-slate-300 rounded-full"></span> 1h
                        </p>
                    </div>
                </div>

                {/* --- Action Menu Section --- */}
                <div className="relative" ref={PostCardSettingRef} >
                    <button 
                        onClick={handleOpenPostCardSetting} 
                        className={`transition-all rounded-full p-1.5 ${isOpenPostCardSetting ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                    >
                        <EllipsisVertical size={20} />
                    </button>

                    {/* Dropdown Menu */}
                    {isOpenPostCardSetting && (
                        <div  className="absolute right-0 top-full mt-2 w-36 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex flex-col py-1">
                                <button 
                                    className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2 transition-colors"
                                    onClick={() => console.log("Edit clicked")}
                                >
                                    <Pencil size={14} />
                                    <span>Edit</span>
                                </button>
                                
                                <div className="h-px bg-slate-50 mx-2 my-0.5"></div>
                                
                                <button 
                                    className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2 transition-colors"
                                    onClick={() => console.log("Delete clicked")}
                                >
                                    <Trash2 size={14} />
                                    <span>Delete</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <p className="text-slate-600 text-sm leading-relaxed mb-4">
                lorem ipsum is simply dummy text of the printing and typesetting industry.lorme
                                lorem ipsum is simply dummy text of the printing and typesetting industry...
                lorem ipsum is simply dummy text of the printing and typesetting industry...

            </p>

            {hasImage && (
                <div className="rounded-2xl overflow-hidden mb-4 border border-slate-100 bg-slate-50 flex justify-center p-4">
                    <img src={Course} alt="Announcement" className="max-h-64 object-contain" />
                </div>
            )}

            <div className="pt-4 border-t border-slate-100 "></div>
            <div className="flex items-center justify-between gap-4 text-slate-500 text-xs font-medium">
                <span>12 Person</span>
                <span>2 Comment</span>
            </div>

            <div className="flex items-center gap-6 mt-4 pt-2 justify-between">
                <button className="flex items-center gap-2 text-blue-600 font-semibold text-sm">
                    <Heart size={20} className="text-blue-600" />
                </button>
                <button className="flex items-center gap-2 text-slate-400 font-semibold text-sm">
                    <MessageSquare size={20} />
                </button>
            </div>
        </div>
    )
};

export default AnnouncementCard;