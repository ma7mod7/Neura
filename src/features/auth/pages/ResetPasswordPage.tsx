import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff, Lock } from 'lucide-react';
import { resetPasswordSchema, type ResetPasswordValues } from '../schema/ForgotPasswordSchema';
import { useResetPassword } from '../api/useForgotPassword';

const ResetPasswordPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { mutate, isPending } = useResetPassword();

    const code = searchParams.get('code');
    const email = searchParams.get('email');

    const { register, handleSubmit, formState: { errors }, setError } = useForm<ResetPasswordValues>({
        resolver: zodResolver(resetPasswordSchema)
    });

    const onSubmit = (data: ResetPasswordValues) => {
        if (!code || !email) {
            setError("root", { message: "Invalid or missing code." });
            return;
        }

        mutate({ ...data, code, email }, {
            onSuccess: () => {
                navigate('/auth/login');
            },
            onError: (error: any) => {
                setError("root", { message: error.response?.data?.message || "Failed to reset password." });
            }
        });
    };

    if (!code || !email) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4 font-inter">
                <div className="max-w-md w-full bg-[#161616] border border-white/10 p-10 rounded-3xl shadow-2xl text-center">
                    {/* Error Icon Box */}
                    <div className="bg-red-500/10 p-4 rounded-full w-fit mx-auto mb-6">
                        <AlertCircle className="w-10 h-10 text-red-500" />
                    </div>

                    {/* Text Content */}
                    <h1 className="text-2xl font-bold text-white mb-2">Invalid Link</h1>
                    <p className="text-slate-400 text-sm leading-relaxed mb-8">
                        This password reset link is invalid or has expired.
                        Please request a new link to secure your account.
                    </p>

                    {/* Action Button */}
                    <Link
                        to="/auth/forget-password"
                        className="inline-block w-full bg-white/5 hover:bg-white/10 text-white font-medium py-3 px-6 rounded-xl transition-all border border-white/10"
                    >
                        Request New Link
                    </Link>

                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4 font-inter">
            <div className="max-w-md w-full bg-[#161616] border border-white/10 p-8 rounded-3xl shadow-2xl">
                <div className="text-center mb-8">
                    <div className="bg-[#0066FF]/20 p-3 rounded-full w-fit mx-auto mb-4">
                        <Lock className="w-8 h-8 text-[#0066FF]" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Set New Password</h1>
                    <p className="text-slate-400 text-sm">Must be at least 6 characters.</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {errors.root && (
                        <div className="bg-red-500/10 text-red-500 p-3 rounded-lg text-sm text-center">
                            {errors.root.message}
                        </div>
                    )}

                    {/* New Password */}
                    <div className="space-y-2">
                        <div className="relative">
                            <input
                                {...register("newPassword")}
                                type={showPassword ? "text" : "password"}
                                placeholder="New Password"
                                className={`w-full bg-white rounded-xl py-3 px-6 text-slate-900 outline-none border-2 transition-all ${errors.newPassword ? 'border-red-500' : 'border-transparent focus:border-[#0066FF]'}`}
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400">
                                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                            </button>
                        </div>
                        {errors.newPassword && <p className="text-red-500 text-sm ml-4">{errors.newPassword.message}</p>}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                        <div className="relative">
                            <input
                                {...register("confirmPassword")}
                                type={showPassword ? "text" : "password"}
                                placeholder="Confirm New Password"
                                className={`w-full bg-white rounded-xl py-3 px-6 text-slate-900 outline-none border-2 transition-all ${errors.confirmPassword ? 'border-red-500' : 'border-transparent focus:border-[#0066FF]'}`}
                            />
                        </div>
                        {errors.confirmPassword && <p className="text-red-500 text-sm ml-4">{errors.confirmPassword.message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-[#0066FF] hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-900/20"
                    >
                        {isPending ? "Resetting..." : "Reset Password"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordPage;