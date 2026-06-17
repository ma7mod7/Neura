import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';

const AuthCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    
    // استخدام useRef لمنع تنفيذ الكود أكثر من مرة في الـ Strict Mode
    const processedRef = useRef(false);

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
            params[key] = decodeURIComponent(value.replace(/\+/g, ' '));
        }
    });

    const { token, refreshToken } = params;

    if (token && refreshToken) {
        processedRef.current = true;

        try {
            // Use /Auth/refresh to get full user data back
            const response = await axios.post('https://neura-lms.runasp.net/Auth/refresh', {
                token,
                refreshToken
            });

            // response.data has id, username, email, firstName, lastName, token, expiresin, etc.
            login(response.data);

            setTimeout(() => navigate('/announcements', { replace: true }), 300);
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
    }, [location.hash, navigate, login]);

    useEffect(() => {
    console.log("=== AuthCallback mounted ===");
    console.log("Full href:", window.location.href);
    console.log("hash:", location.hash);
    console.log("search:", location.search);
    console.log("pathname:", location.pathname);
}, []);

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