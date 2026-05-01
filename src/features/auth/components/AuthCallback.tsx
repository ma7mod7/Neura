import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const AuthCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth(); 

    useEffect(() => {
        const hash = location.hash.substring(1);
        const params = new URLSearchParams(hash); 

        const token = params.get('token');
        const refreshToken = params.get('refreshToken');

        if (token && refreshToken) {
            const authData = {
                token: token,
                refreshToken: refreshToken,
                
                
            };

            login({authData});

            navigate('/announcements', { replace: true }); 
        } else {
            navigate('/auth/login', { replace: true });
        }
    }, [location, navigate, login]);

    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0e0e10]">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
            <p className="text-slate-300 font-medium">Completing your login...</p>
        </div>
    );
};

export default AuthCallback;