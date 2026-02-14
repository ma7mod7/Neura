import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, CheckCircle2 } from 'lucide-react';
import { forgotPasswordSchema, type ForgotPasswordValues } from '../schema/ForgotPasswordSchema';
import { useForgotPassword } from '../api/useForgotPassword';

const ForgotPasswordPage = () => {
    const [isEmailSent, setIsEmailSent] = useState(false);
    const { mutate, isPending } = useForgotPassword();

    const { register, handleSubmit, formState: { errors }, setError } = useForm<ForgotPasswordValues>({
        resolver: zodResolver(forgotPasswordSchema)
    });

    const onSubmit = (data: ForgotPasswordValues) => {
        mutate(data, {
            onSuccess: () => {
                setIsEmailSent(true); 
            },
            onError: (error: any) => {
                setError("root", {
                    message: error.response?.data?.message || "Failed to send reset link."
                });
            }
        });
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4 font-inter">
            <div className="max-w-md w-full bg-[#161616] border border-white/10 p-8 rounded-3xl shadow-2xl">

                {/* حالة النجاح: تم إرسال الإيميل */}
                {isEmailSent ? (
                    <div className="text-center space-y-6 animate-in zoom-in duration-300">
                        <div className="bg-[#0066FF]/20 p-4 rounded-full w-fit mx-auto">
                            <CheckCircle2 className="w-12 h-12 text-[#0066FF]" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">Check your mail</h2>
                            <p className="text-slate-400">
                                We have sent a password reset link to your email.
                            </p>
                        </div>
                    </div>
                ) : (
                    /* حالة الفورم: إدخال الإيميل */
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-white mb-2">Forgot Password?</h1>
                            <p className="text-slate-400">No worries, we'll send you reset instructions.</p>
                        </div>

                        {errors.root && (
                            <div className="bg-red-500/10 text-red-500 p-3 rounded-lg text-sm text-center">
                                {errors.root.message}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-slate-300 text-sm ml-2">Email Address</label>
                            <div className="relative">
                                <input
                                    {...register("email")}
                                    placeholder="Enter your email"
                                    className="w-full bg-white rounded-xl py-3 pl-12 pr-6 text-slate-900 outline-none border-2 border-transparent focus:border-[#0066FF] transition-all"
                                />
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            </div>
                            {errors.email && <p className="text-red-500 text-sm ml-4">{errors.email.message}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full bg-[#0066FF] hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-70"
                        >
                            {isPending ? "Sending..." : "Send Reset Link"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPasswordPage;