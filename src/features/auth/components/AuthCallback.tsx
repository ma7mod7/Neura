import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { decodeToken } from '../../../utils/jwt';

const AuthCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const queryClient = useQueryClient();
    const processedRef = useRef(false);
    const loginRef = useRef(login);

    // Keep loginRef current without adding login to effect deps
    useEffect(() => {
        loginRef.current = login;
    });

    useEffect(() => {
        if (processedRef.current) return;

        const handleCallback = async () => {
            const hash = location.hash.substring(1);

            if (!hash) {
                navigate('/auth/login', { replace: true });
                return;
            }

            const params: Record<string, string> = {};
            hash.split('&').forEach(part => {
                const eqIndex = part.indexOf('=');
                if (eqIndex !== -1) {
                    const key = part.substring(0, eqIndex);
                    const value = part.substring(eqIndex + 1);
                    params[key] = decodeURIComponent(value);
                }
            });

            const { token, refreshToken } = params;

            if (token && refreshToken) {
                processedRef.current = true;

                try {
                    const response = await axios.post('https://neura-lms.runasp.net/Auth/refresh', {
                        token,
                        refreshToken
                    });

                    const data = response.data;

                    if (!data.username && !data.userName) {
                        const decoded = decodeToken(token);
                        data.username =
                            (decoded?.preferred_username as string) ||
                            (decoded?.given_name as string) ||
                            data.firstName ||
                            data.email?.split('@')[0] ||
                            'User';
                    }

                    // Write to storage first
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('refreshToken', data.refreshToken);
                    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

                    // Use ref to avoid re-triggering this effect
                    loginRef.current(data);

                    // Clear stale query cache
                    queryClient.clear();

                    setTimeout(() => navigate('/announcements', { replace: true }), 500);
                } catch (error: any) {
                    console.error("Refresh error:", error.response?.status, error.response?.data);
                    navigate('/auth/login', { replace: true });
                }
            } else {
                console.error("Missing tokens in hash. Keys found:", Object.keys(params));
                navigate('/auth/login', { replace: true });
            }
        };

        handleCallback();
    // Only depend on stable values — NOT login
    }, [location.hash, navigate, queryClient]);

    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0e0e10]">
            <div className="relative">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={56} />
                <div className="absolute inset-0 blur-xl bg-blue-600/20 animate-pulse rounded-full"></div>
            </div>
            <div className="text-center z-10">
                <h3 className="text-white font-bold text-xl mb-2">Authenticating</h3>
                <p className="text-slate-400 text-sm">Finishing your secure sign-in...</p>
            </div>
        </div>
    );
};

export default AuthCallback;