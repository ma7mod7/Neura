import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Eye,
    EyeOff,
    CodeXml,
    GithubIcon,
    Database,
    House,
    Globe
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
import { useTranslation } from 'react-i18next';

const BACKEND_BASE_URL = "https://neura-brhac2ghgvdtbggn.francecentral-01.azurewebsites.net";

const LoginPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { mutate, isPending } = useLogin();
    const { login } = useAuth();
    const { t, i18n } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.resolvedLanguage === 'ar' ? 'en' : 'ar';
        i18n.changeLanguage(newLang);
    };
    const sliderData = [
        {
            id: 1,
            image: Teamwork,
            fullQuote: t('auth.slides.teamwork')
        },
        {
            id: 2,
            image: Mind,
            fullQuote: t('auth.slides.mind')
        },
        {
            id: 3,
            image: Effort,
            fullQuote: t('auth.slides.effort')
        }
    ];

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        setError
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema)
    });


    const handleSocialLogin = (provider: string) => {
        window.location.href = `${BACKEND_BASE_URL}/auth/external-login/${provider}`;
    };

    const onSubmit = (data: LoginFormValues) => {
        mutate(data, {
            onSuccess: (response) => {
                login(response);
                reset();
                navigate('/announcements');
            },
            onError: (error: any) => {
                const errorMessage = error.response?.data?.errors?.[1] || t('auth.invalidCredentials');
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

                <div className="relative px-4 lg:px-8 flex flex-col justify-center">

                    <div className="flex items-center justify-between mb-4">
                        <button className="inline w-fit p-2 hover:bg-gray-100 rounded-full" onClick={() => navigate('/')}>
                            <svg width="0" height="0" className="absolute">
                                <defs>
                                    <linearGradient id="house-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="32%" stopColor="#4B5BE9" />
                                        <stop offset="69%" stopColor="#3B8FC0" />
                                    </linearGradient>
                                </defs>
                            </svg>

                            <House
                                size={40}
                                stroke="url(#house-gradient)"
                                className="hover:scale-105 transition-transform duration-300 cursor-pointer"
                            />
                        </button>

                        <button
                            onClick={toggleLanguage}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors font-medium text-sm"
                        >
                            <Globe size={18} />
                            <span>{i18n.resolvedLanguage === 'ar' ? 'EN' : 'AR'}</span>
                        </button>
                    </div>

                    <svg width="0" height="0" className="absolute">
                        <linearGradient id="icon-gradient" x1="10%" y1="0%" x2="10%" y2="100%">
                            <stop offset="0%" stopColor="#4262E4" />
                            <stop offset="60%" stopColor="#3995B9" />
                        </linearGradient>
                    </svg>
                    <CodeXml strokeWidth={3} stroke="url(#icon-gradient)" className="hidden xl:block absolute top-12 end-[4%] w-14 h-14" />
                    <RiBardLine fill="url(#icon-gradient)" stroke="url(#icon-gradient)" className="hidden xl:block absolute top-1/2 -start-10 w-14 h-14" />
                    <Database stroke="url(#icon-gradient)" className="hidden xl:block absolute bottom-1 end-[2%] w-14 h-14 rotate-12" />

                    <div className="mb-10">
                        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4 text-center">
                            {t('auth.welcomeBack')}
                            <span className="bg-gradient-to-r from-[#5042E4] to-[#36A1B3] bg-clip-text text-transparent ms-2">
                                {t('auth.problemSolver')}
                            </span>
                        </h1>
                        <p className="text-slate-400 text-lg text-center">{t('auth.loginSubtitle')}</p>
                    </div>

                    {errors.root && (
                        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 mb-4 flex items-center gap-2 max-w-xl mx-auto w-full">
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
                                    placeholder={t('auth.usernameOrEmail')}
                                    className={`w-full bg-white rounded-full py-4 px-6 text-slate-900 outline-none border-2 transition-all ${errors.userNameOrEmail ? 'border-red-500' : 'border-transparent focus:border-blue-500'}`}
                                />
                            </div>
                            {errors.userNameOrEmail && <p className="text-red-500 text-sm ms-4">{t(errors.userNameOrEmail.message || '')}</p>}
                        </div>

                        <div className="space-y-2">
                            <div className="relative">
                                <input
                                    {...register("password")}
                                    type={showPassword ? "text" : "password"}
                                    placeholder={t('auth.password')}
                                    className={`w-full bg-white rounded-full py-4 ps-6 pe-14 text-slate-900 outline-none border-2 transition-all ${errors.password ? 'border-red-500' : 'border-transparent focus:border-blue-500'}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute end-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                                </button>
                            </div>
                            <div className="flex justify-end">
                                <Link to="/auth/forget-password" className="text-sm text-slate-400 hover:text-white hover:underline transition-colors">{t('auth.forgotPassword')}</Link>
                            </div>
                            {errors.password && <p className="text-red-500 text-sm ms-4">{t(errors.password.message || '')}</p>}
                        </div>


                        <button
                            type="submit"
                            disabled={isSubmitting || isPending}
                            className="w-full bg-[#0066FF] hover:bg-blue-700 text-white font-semibold py-4 rounded-full shadow-lg shadow-blue-900/20 transition-all active:scale-95 disabled:opacity-70"
                        >
                            {isPending ? (
                                <div className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    {t('auth.loggingIn')}
                                </div>
                            ) : t('auth.login')}
                        </button>

                        <div className="relative flex items-center gap-4 py-2">
                            <div className="h-[1px] flex-1 bg-slate-800"></div>
                            <span className="text-slate-500 text-sm">{t('auth.orContinueWith')}</span>
                            <div className="h-[1px] flex-1 bg-slate-800"></div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">

                            <button
                                type="button"
                                onClick={() => handleSocialLogin('Google')}
                                className="flex items-center justify-center gap-3 bg-[#D1D5DB] hover:bg-white text-slate-900 font-semibold lg:py-4 py-2 px-4 rounded-full transition-all"
                            >
                                <img src="https://www.google.com/favicon.ico" className="w-8 h-8" alt="Google" />
                                {t('auth.continueWithGoogle')}
                            </button>


                            <button
                                type="button"
                                onClick={() => handleSocialLogin('GitHub')}
                                className="flex items-center justify-center gap-3 bg-[#D1D5DB] hover:bg-white text-slate-900 font-semibold lg:py-4 py-2 px-4 rounded-full transition-all"
                            >
                                <GithubIcon className='w-8 h-8 ' />
                                {t('auth.continueWithGithub')}
                            </button>
                        </div>

                        <div className="absolute -bottom-10 inset-x-0 w-full overflow-hidden leading-[0] pointer-events-none rounded-full">
                            <svg
                                viewBox="0 0 600 150"
                                preserveAspectRatio="none"
                                className="w-full h-[110px] rounded-full ms-8 "
                            >
                                <defs>
                                    <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#8B5CF6" />
                                        <stop offset="50%" stopColor="#3B82F6" />
                                        <stop offset="100%" stopColor="#2DD4BF" />
                                    </linearGradient>
                                </defs>

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

                    <button onClick={() => navigate('/auth/signup')} className="mt-10 text-slate-400 text-center z-10">
                        {t('auth.notMember')} <span className="bg-gradient-to-r from-[#5042E4] to-[#38B7DE] bg-clip-text text-transparent font-bold hover:underline cursor-pointer">{t('auth.registerNow')}</span>
                    </button>
                </div>

                <div className="hidden lg:block 2xl:h-[95dvh]">
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
                                    <div className="flex flex-col h-full items-center">
                                        <div className="bg-white w-full xl:h-[550px] rounded-[2rem] p-8 flex items-center justify-center">
                                            <img
                                                src={slide.image}
                                                alt="illustration"
                                                className="max-w-full max-h-full object-contain"
                                            />
                                        </div>

                                        <div className="text-center px-6 mb-10">
                                            <h2 className="text-4xl font-medium text-white leading-snug mt-6">
                                                {slide.fullQuote}
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
