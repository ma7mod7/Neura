import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../../../shared/api/axiosInstance';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuth();

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState('');
    const userId = searchParams.get('userId');
    const code = searchParams.get('code');

    useEffect(() => {
        const verify = async () => {

            try {
                const response = await axiosInstance.post('/Auth/confirm-email', {
                    userId,
                    code
                });

                if (!userId || !code) {
                    setStatus('error');
                    setErrorMessage('Invalid verification link.');
                    return;
                }

                login(response.data);
                setStatus('success');
                setTimeout(() => {
                    navigate('/announcements', { replace: true });
                }, 3000);
            } catch (error: any) {
                setStatus('error');
                setErrorMessage(error.response?.data?.message || 'Verification failed. The link may be expired.');
            }
        };

        verify();
    }, [code, userId, navigate]);

    return (
        <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4 font-inter text-white relative overflow-hidden">
            <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-[#0066FF]/10 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-[#0066FF]/10 blur-[120px] rounded-full"></div>

            <div className="max-w-md w-full bg-[#111111] border border-white/5 p-10 rounded-[2.5rem] text-center shadow-2xl relative z-10">

                {status === 'loading' && (
                    <div className="flex flex-col items-center gap-6">
                        <div className="relative">
                            <Loader2 className="w-16 h-16 text-[#0066FF] animate-spin" strokeWidth={1.5} />
                            <div className="absolute inset-0 blur-xl bg-[#0066FF]/30 animate-pulse"></div>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Verifying Account</h2>
                            <p className="text-slate-400">Please wait a moment while we secure your access.</p>
                        </div>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center gap-6 animate-in zoom-in duration-500">
                        <div className="bg-[#0066FF]/15 p-5 rounded-full relative">
                            <CheckCircle2 className="w-14 h-14 text-[#0066FF]" strokeWidth={1.5} />
                            <div className="absolute inset-0 blur-lg bg-[#0066FF]/20 rounded-full"></div>
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold mb-2">Success!</h2>
                            <p className="text-slate-400 leading-relaxed">
                                Your email has been verified. <br />
                                Preparing your workspace...
                            </p>
                        </div>
                        <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden mt-2">
                            <div className="h-full bg-[#0066FF] animate-progress-loading w-full"></div>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center gap-6 animate-in fade-in duration-300">
                        <div className="bg-red-500/10 p-5 rounded-full">
                            <XCircle className="w-14 h-14 text-red-500" strokeWidth={1.5} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-red-500 mb-2">Verification Failed</h2>
                            <p className="text-slate-400 mb-6 px-4">{errorMessage}</p>
                        </div>
                        <button
                            onClick={() => navigate('/signup')}
                            className="w-full bg-[#0066FF] hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-95"
                        >
                            Return to Sign Up
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;