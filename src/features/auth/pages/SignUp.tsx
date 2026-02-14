import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, CodeXml, GithubIcon, Database } from 'lucide-react';
import { RiBardLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import signupSchema, { type SignUpFormValues } from '../schema/SignUpSchema';
import { useSignup } from '../api/useSignUp';

const SignupPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { mutate, isPending } = useSignup();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setError
    } = useForm<SignUpFormValues>({
        resolver: zodResolver(signupSchema)
    });

    const onSubmit = (data: SignUpFormValues) => {
        mutate(data, {
            onSuccess: () => {
                reset();
                navigate('/auth/confirm-email',{replace: true});
            },
            onError: (error) => {
                setError("root", { message: error.response?.data?.errors?.[1] || 'Signup failed' });
            }
        });
    };

    const inputClasses = (errorField: any) => `
        w-full bg-white rounded-full py-4 px-6 text-slate-900 outline-none border-2 transition-all
        ${errorField ? 'border-red-500' : 'border-transparent focus:border-[#0066FF]'}
    `;

    return (
        <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-4 font-inter overflow-hidden relative">

            <svg width="0" height="0" className="absolute">
                <linearGradient id="icon-gradient" x1="10%" y1="0%" x2="10%" y2="100%">
                    <stop offset="0%" stopColor="#4262E4" />
                    <stop offset="60%" stopColor="#3995B9" />
                </linearGradient>
            </svg>
            <CodeXml strokeWidth={3} stroke="url(#icon-gradient)" className="hidden xl:block absolute top-20 right-[15%] w-16 h-16 " />
            <RiBardLine fill="url(#icon-gradient)" stroke="url(#icon-gradient)" className="hidden xl:block absolute top-[40%] left-[10%] w-12 h-12" />
            <Database stroke="url(#icon-gradient)" className="hidden xl:block absolute bottom-20 right-[10%] w-14 h-14 -rotate-12" />

            <div className="mb-8 text-center">
                <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2">
                    welcome,
                    <span className="bg-gradient-to-r from-[#5042E4] to-[#36A1B3] bg-clip-text text-transparent ml-2">
                        Problem solver!
                    </span>
                </h1>
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

            <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-3xl space-y-4 relative z-10">

                {/* Username & Full Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                        <input {...register("firstName")} placeholder="First Name" className={inputClasses(errors.firstName)} />
                        {errors.firstName && <p className="text-red-500 text-xs mt-1 ml-4 animate-in fade-in slide-in-from-top-1">{errors.firstName.message}</p>}
                    </div>
                    <div className="flex flex-col">
                        <input {...register("lastName")} placeholder="Last Name" className={inputClasses(errors.lastName)} />
                        {errors.lastName && <p className="text-red-500 text-xs mt-1 ml-4 animate-in fade-in slide-in-from-top-1">{errors.lastName.message}</p>}
                    </div>
                </div>
                <div className="flex flex-col">
                    <input {...register("userName")} placeholder="User Name" className={inputClasses(errors.userName)} />
                    {errors.userName && <p className="text-red-500 text-xs mt-1 ml-4 animate-in fade-in slide-in-from-top-1">{errors.userName.message}</p>}
                </div>
                {/* Email */}
                <div className="flex flex-col">
                    <input {...register("email")} placeholder="Email" className={inputClasses(errors.email)} />
                    {errors.email && <p className="text-red-500 text-xs mt-1 ml-4 animate-in fade-in slide-in-from-top-1">{errors.email.message}</p>}
                </div>

                {/* Password Field */}
                <div className="flex flex-col">
                    <div className="relative">
                        <input {...register("password")} type={showPassword ? "text" : "password"} placeholder="Password" className={inputClasses(errors.password)} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                            {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                        </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-xs mt-1 ml-4 animate-in fade-in slide-in-from-top-1">{errors.password.message}</p>}
                </div>

                {/* Confirm Password */}
                <div className="flex flex-col">
                    <div className="relative">
                        <input {...register("confirmPassword")} type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password" className={inputClasses(errors.confirmPassword)} />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                            {showConfirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                        </button>
                    </div>
                    {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 ml-4 animate-in fade-in slide-in-from-top-1">{errors.confirmPassword.message}</p>}
                </div>

                {/* Discord & Phone */}
                <div className="flex flex-col">
                    <input {...register("discordHandle")} placeholder="Discord Handle" className={inputClasses(errors.discordHandle)} />
                    {errors.discordHandle && <p className="text-red-500 text-xs mt-1 ml-4">{errors.discordHandle.message}</p>}
                </div>

                {/* Create Account Button */}
                <button type="submit" disabled={isPending} className="w-full bg-[#0066FF] hover:bg-blue-700 text-white font-bold py-4 rounded-full shadow-lg transition-all active:scale-95">
                    {isPending ? (
                        <div className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            Creating Account...
                        </div>
                    ) : "Create Account"}
                </button>

                {/* Social Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <button
                        type="button"
                        className="flex-1 flex items-center justify-center gap-3 bg-[#D1D5DB] hover:bg-white text-slate-900 font-semibold py-4 md:rounded-l-full rounded-full transition-all">
                        <img src="https://www.google.com/favicon.ico" className="w-6 h-6" alt="Google" />
                        continue with Google
                    </button>
                    <button
                        type="button"
                        className="flex-1 flex items-center justify-center gap-3 bg-[#D1D5DB] hover:bg-white text-slate-900 font-semibold py-4 md:rounded-r-full rounded-full transition-all">
                        <GithubIcon className='w-6 h-6' />
                        continue with GitHub
                    </button>
                </div>

                {/* Footer Link */}
                <p className="text-center text-slate-400 pt-4">
                    Already have an account?
                    <button type="button" onClick={() => navigate('/auth/login')} className="text-blue-500 font-bold ml-2 hover:underline">Login now</button>
                </p>
            </form>

            {/* --- SVG Background: Parallel Wavy Lines --- */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 hidden lg:block">
                <svg
                    viewBox="0 0 1440 900"
                    preserveAspectRatio="xMidYMid slice"
                    className="w-full h-full absolute top-0 left-0"
                >
                    <defs>
                        <linearGradient
                            id="signup-lines-gradient"
                            x1="0%"
                            y1="100%"
                            x2="100%"
                            y2="0%"
                        >
                            <stop offset="0%" stopColor="#8B5CF6" />
                            <stop offset="50%" stopColor="#3B82F6" />
                            <stop offset="100%" stopColor="#2DD4BF" />
                        </linearGradient>
                    </defs>

                    <path
                        d="M-300,950 C0,450 850,1000 1400,50"
                        stroke="url(#signup-lines-gradient)"
                        strokeWidth="12"
                        fill="none"
                        strokeLinecap="round"
                    />

                    <path
                        d="M-300,950 C0,450 850,1000 1400,50"
                        stroke="url(#signup-lines-gradient)"
                        strokeWidth="12"
                        fill="none"
                        strokeLinecap="round"
                        transform="translate(40, 40)"
                        opacity="0.9"
                    />
                </svg>
            </div>

        </div>
    );
};

export default SignupPage;