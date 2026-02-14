import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Eye,
    EyeOff,
    CodeXml,
    GithubIcon,
    Database
} from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import Effort from '../../../assets/Effort.jpg';
import Mind from '../../../assets/Mind.jpg';
import Teamwork from '../../../assets/Teamwork.jpg';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import { RiBardLine } from 'react-icons/ri';
import { Link, useNavigate } from 'react-router-dom';
import { useLogin } from '../api/useLogin';
import type { LoginFormValues } from '../schema/LoginSchmea';
import loginSchema from '../schema/LoginSchmea';
import { useAuth } from '../hooks/useAuth';



const sliderData = [
    {
        id: 1,
        image: Teamwork,
        fullQuote: "Alone we are smart. Together we are brilliant.",
        highlight: "brilliant"
    },
    {
        id: 2,
        image: Mind,
        fullQuote: "Building the mind that solves the puzzle",
        highlight: "mind"
    },
    {
        id: 3,
        image: Effort,
        fullQuote: "Effort is the algorithm that powers your growth.",
        highlight: "Effort"
    }
];

const LoginPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { mutate, isPending } = useLogin();
    const { login } = useAuth();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        setError
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema)
    });

    const onSubmit = (data: LoginFormValues) => {
        mutate(data, {
            onSuccess: (response) => {
                login(response);
                reset();
                navigate('/announcements');
            },
            onError: (error) => {
                const errorMessage = error.response?.data?.errors?.[1];
                console.log(errorMessage);
                setError("root", {
                    type: "manual",
                    message: errorMessage,
                });
            }
        });
    };

    return (
        <div className="h-dvh bg-[#0A0A0A] flex items-center justify-center p-2 lg:p-4 font-inter overflow-hidden">
            <div className="w-full max-w-[1550px] grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

                {/* --- القسم الأيسر: الفورم --- */}
                <div className="relative px-4 lg:px-8 flex flex-col justify-center">
                    {/* أيقونات ديكورية خلفية */}
                    <svg width="0" height="0" className="absolute">
                        <linearGradient id="icon-gradient" x1="10%" y1="0%" x2="10%" y2="100%">
                            <stop offset="0%" stopColor="#4262E4" />
                            <stop offset="60%" stopColor="#3995B9" />
                        </linearGradient>
                    </svg>
                    <CodeXml strokeWidth={3} stroke="url(#icon-gradient)" className="hidden xl:block absolute top-12 right-[4%] w-14 h-14" />
                    <RiBardLine fill="url(#icon-gradient)" stroke="url(#icon-gradient)" className="hidden xl:block absolute top-1/2 -left-10 w-14 h-14" />
                    <Database stroke="url(#icon-gradient)" className="hidden xl:block absolute bottom-1 right-[2%] w-14 h-14 rotate-12" />

                    <div className="mb-10">
                        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4 y text-center">
                            Welcome back,
                            {/* طريقة عمل الخط الجريدينت بالـ Tailwind */}
                            <span className="bg-gradient-to-r from-[#5042E4] to-[#36A1B3] bg-clip-text text-transparent">
                                Problem solver!
                            </span>
                        </h1>
                        <p className="text-slate-400 text-lg text-center "> Develop your skills and prepare for the next challenge.</p>
                    </div>
                    {errors.root && (
                        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 mb-4 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span className="text-red-500 text-sm font-medium">
                                {errors.root.message}
                            </span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-xl flex flex-col mx-auto w-full">

                        <div className="space-y-2">
                            <div className="relative">
                                <input
                                    {...register("userNameOrEmail")}
                                    type="text"
                                    placeholder="Username or Email"
                                    className={`w-full bg-white rounded-full py-4 px-6 text-slate-900 outline-none border-2 transition-all ${errors.userNameOrEmail ? 'border-red-500' : 'border-transparent focus:border-blue-500'}`}
                                />
                            </div>
                            {errors.userNameOrEmail && <p className="text-red-500 text-sm ml-4">{errors.userNameOrEmail.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <div className="relative">
                                <input
                                    {...register("password")}
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    className={`w-full bg-white rounded-full py-4 px-6 text-slate-900 outline-none border-2 transition-all ${errors.password ? 'border-red-500' : 'border-transparent focus:border-blue-500'}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                                </button>
                            </div>
                            <div className="flex justify-end">
                                <Link to="/auth/forget-password" className="text-sm text-slate-400 hover:text-white hover:underline transition-colors">forget Password?</Link>
                            </div>
                            {errors.password && <p className="text-red-500 text-sm ml-4">{errors.password.message}</p>}
                        </div>
                        {/* زر تسجيل الدخول */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-[#0066FF] hover:bg-blue-700 text-white font-semibold py-4 rounded-full shadow-lg shadow-blue-900/20 transition-all active:scale-95 disabled:opacity-70"
                        >
                            {isPending ? (
                                <div className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    Logging in...
                                </div>
                            ) : "Login"}
                        </button>

                        <div className="relative flex items-center gap-4 py-2">
                            <div className="h-[1px] flex-1 bg-slate-800"></div>
                            <span className="text-slate-500 text-sm">or continue with</span>
                            <div className="h-[1px] flex-1 bg-slate-800"></div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <button type="button" className="flex items-center justify-center gap-3 bg-[#D1D5DB] hover:bg-white text-slate-900 font-semibold lg:py-4 py-2 px-4 rounded-full transition-all">
                                <img src="https://www.google.com/favicon.ico" className="w-8 h-8" alt="Google" />
                                continue with Google
                            </button>
                            <button type="button" className=" flex items-center justify-center gap-3 bg-[#D1D5DB] hover:bg-white text-slate-900 font-semibold lg:py-4 py-2 px-4 rounded-full transition-all">
                                <GithubIcon className='w-8 h-8 ' />
                                continue with GitHub
                            </button>
                        </div>
                        {/* --- المكون الخاص بالخط المتموج --- */}
                        <div className="absolute  -bottom-10 left-0 w-full overflow-hidden leading-[0] pointer-events-none rounded-full">
                            <svg
                                viewBox="0 0 600 150"
                                preserveAspectRatio="none"
                                className="w-full h-[110px] rounded-full ml-8 "
                            >
                                {/* تعريف التدرج اللوني (Gradient) */}
                                <defs>
                                    <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#8B5CF6" /> {/* لون بنفسجي - Purple */}
                                        <stop offset="50%" stopColor="#3B82F6" /> {/* لون أزرق - Blue */}
                                        <stop offset="100%" stopColor="#2DD4BF" /> {/* لون تيل/سيان - Teal/Cyan */}
                                    </linearGradient>
                                </defs>

                                {/* رسم الخط باستخدام الـ Path */}
                                <path
                                    d="M30,80 C190,10 350,0 500,80"
                                    stroke="url(#line-gradient)"
                                    strokeWidth="14"
                                    fill="transparent"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </div>
                    </form>

                    <button onClick={() => navigate('/auth/signup')} className="mt-10 text-slate-400 text-center ">
                        Not a member? <a href="#" className="bg-gradient-to-r from-[#5042E4] to-[#38B7DE] bg-clip-text text-transparent font-bold hover:underline">Register now</a>
                    </button>
                </div>

                {/* --- القسم الأيمن: السلايدر --- */}
                <div className="hidden lg:block   2xl:h-[95dvh]   ">
                    <div className="bg-[#1E4DFF] w-full h-full rounded-[2.5rem] p-8 flex flex-col relative overflow-hidden">

                        <Swiper
                            modules={[Autoplay, Pagination]}
                            autoplay={{ delay: 3000 }}
                            pagination={{
                                clickable: true,
                                bulletClass: 'swiper-pagination-bullet !bg-white !opacity-50',
                                bulletActiveClass: '!opacity-100 !w-8 !rounded-full transition-all'
                            }}
                            className="w-full h-full pb-10"
                        >
                            {sliderData.map((slide) => (
                                <SwiperSlide key={slide.id}>
                                    <div className="flex flex-col h-full items-center  ">
                                        <div className="bg-white w-full xl:h-[550px] md:h- rounded-[2rem] p-8 flex items-center justify-center ">
                                            <img
                                                src={slide.image}
                                                alt="illustration"
                                                className="max-w-full max-h-full object-contain  "
                                            />
                                        </div>

                                        <div className="text-center px-6 mb-10">
                                            <h2 className="text-4xl font-medium  text-white leading-snug mt-6">
                                                {slide.fullQuote.split(new RegExp(`(${slide.highlight})`, 'gi')).map((part, index) =>
                                                    part.toLowerCase() === slide.highlight.toLowerCase() ? (
                                                        <span
                                                            key={index}
                                                            className="bg-[linear-gradient(90deg,_#5CE1E6_52%,_#279EC2)] bg-clip-text text-transparent"
                                                        >
                                                            {part}
                                                        </span>
                                                    ) : (
                                                        <span key={index}>{part}</span>
                                                    )
                                                )}
                                            </h2>
                                        </div>
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default LoginPage;