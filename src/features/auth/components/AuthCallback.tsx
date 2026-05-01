import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const AuthCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    
    // استخدام useRef لمنع تنفيذ الكود أكثر من مرة في الـ Strict Mode
    const processedRef = useRef(false);

    useEffect(() => {
        if (processedRef.current) return;

        // 1. استخراج الـ Hash من الـ URL
        const hash = location.hash.substring(1);
        
        if (!hash) {
            console.warn("AuthCallback: No hash found, redirecting to login.");
            navigate('/auth/login', { replace: true });
            return;
        }

        // 2. تحليل البيانات يدوياً لضمان سلامة الرموز الخاصة (+, /, =)
        const params: Record<string, string> = {};
        hash.split('&').forEach(part => {
            const [key, value] = part.split('=');
            if (key && value) {
                params[key] = decodeURIComponent(value);
            }
        });

        const { token, refreshToken } = params;

        if (token && refreshToken) {
            processedRef.current = true; // علامة لمنع التكرار
            
            try {
                // 3. تنفيذ عملية تسجيل الدخول
                // تأكد أن دالة login تقوم بتحديث الـ State كاملاً (User + Token)
                login({ token, refreshToken } as any);

                console.log("AuthCallback: Login successful, redirecting...");

                // 4. توجيه المستخدم للمسار المطلوب بـ delay بسيط
                // لضمان استقرار الـ Context/LocalStorage
                const timer = setTimeout(() => {
                    navigate('/announcements', { replace: true });
                }, 300);

                return () => clearTimeout(timer);
                
            } catch (error) {
                console.error("AuthCallback: Error during login execution:", error);
                navigate('/auth/login', { replace: true });
            }
        } else {
            console.error("AuthCallback: Missing tokens in hash.");
            navigate('/auth/login', { replace: true });
        }
    }, [location.hash, navigate, login]);

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