import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import { ChevronLeft, ChevronRight, MessageSquareText } from 'lucide-react';


export interface Comment {
    id: string;      
    name: string;
    feedback: string;
    avatar?: string; 
}

interface StudentOpinionsProps {
    comments: Comment[]; 
}

export const CommentsSection = (comments:StudentOpinionsProps) => {
    console.log(comments)
    return (
        <div><div className="mx-auto max-w-7xl px-4 mt-10">
            <div className="relative pb-20">
                <Swiper
                    modules={[Navigation]}
                    spaceBetween={20}
                    slidesPerView={1}
                    navigation={{
                        prevEl: '.swiper-button-prev-custom',
                        nextEl: '.swiper-button-next-custom',
                    }}
                    breakpoints={{
                        768: { slidesPerView: 2 },
                        1024: { slidesPerView: 3 },
                    }}
                >
                    {comments.comments.map((item) => (
                        <SwiperSlide key={item.id}>
                            <div className="bg-[#E3E8EF] p-8 lg:p-10 rounded-[1.8rem] border-2 border-[#0066FF] min-h-[400px] lg:h-[450px] flex flex-col justify-between shadow-sm">
                                <div>
                                    <div className="mb-6 text-[#0066FF]">
                                        <MessageSquareText className="w-10 h-10" fill="currentColor" fillOpacity={0.2} />
                                    </div>
                                    <p className="text-[#64748B] text-base lg:text-lg leading-relaxed font-medium line-clamp-6">{item.feedback}</p>
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 mt-6">{item.name}</h4>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
                <div className="absolute bottom-0 right-0 flex gap-4 z-10">
                    <button className="swiper-button-prev-custom w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-[#D1D5DB] flex items-center justify-center text-[#0066FF] hover:bg-[#0066FF] hover:text-white transition-all shadow-md">
                        <ChevronLeft className="w-6 h-6 lg:w-8 lg:h-8" strokeWidth={3} />
                    </button>
                    <button className="swiper-button-next-custom w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-[#D1D5DB] flex items-center justify-center text-[#0066FF] hover:bg-[#0066FF] hover:text-white transition-all shadow-md">
                        <ChevronRight className="w-6 h-6 lg:w-8 lg:h-8" strokeWidth={3} />
                    </button>
                </div>
            </div>
        </div></div>
    )
}
