import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';

interface User {
    id: string;
    userName: string;
    email: string;
    firstName: string;
    lastName: string;
    discordHandle: string;
}

interface AuthResponse extends User {
    token: string;
    expiresin: number; 
    refreshToken: string;
    refreshTokenExpiration: string;
}

interface AuthContextType {
    email: string;
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (authData: AuthResponse) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('tokenExpiration'); 
        delete axios.defaults.headers.common['Authorization'];
        
        window.location.href = '/auth/login'; 
    };

    const login = (authData: AuthResponse) => {
        const { token, refreshToken, expiresin, ...userData } = authData;
    
        const expirationTime = new Date().getTime() + (expiresin * 1000); 

        setToken(token);
        setUser(userData);

        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('tokenExpiration', expirationTime.toString()); 

        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    };

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        const storedExpiration = localStorage.getItem('tokenExpiration'); 
        const storedRefreshToken = localStorage.getItem('refreshToken');

        const isValidToken = storedToken && storedToken !== "undefined" && storedToken !== "null";
        const isValidUser = storedUser && storedUser !== "undefined" && storedUser !== "null";

        if (isValidToken && isValidUser && storedExpiration) {
            const currentTime = new Date().getTime();
            const expirationTime = parseInt(storedExpiration, 10);

            // التحقق مما إذا كان التوكن قد انتهى
            if (currentTime > expirationTime) {
                // محاولة تجديد التوكن إذا كان لدينا Refresh Token
                if (storedRefreshToken) {
                    // ملاحظة: تأكد من تعديل المسار الأساسي (Base URL) ليتطابق مع مشروعك
                    axios.post('/Auth/refresh', { refreshToken: storedRefreshToken })
                        .then(response => {
                            // نجح التجديد! نستخدم دالة login لتحديث البيانات
                            login(response.data);
                        })
                        .catch(error => {
                            // فشل التجديد (الـ Refresh Token انتهى أيضاً أو غير صالح)
                            console.error("Session expired. Please login again.", error);
                            logout();
                        })
                        .finally(() => {
                            setIsLoading(false);
                        });
                    return; // نوقف التنفيذ هنا لانتظار استجابة الـ API
                } else {
                    // لا يوجد Refresh Token، اطرد المستخدم
                    logout();
                    setIsLoading(false);
                    return;
                }
            }

            // إذا كان التوكن لا يزال صالحاً، نقوم بوضعه في الـ State
            try {
                const parsedUser = JSON.parse(storedUser);
                setToken(storedToken);
                setUser(parsedUser);
                axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
            } catch (error) {
                console.error("Error parsing user from storage", error);
                logout();
            }
        } else {
            // تنظيف البيانات في حال كانت غير مكتملة أو معطوبة بدون عمل توجيه
            setToken(null);
            setUser(null);
            delete axios.defaults.headers.common['Authorization'];
        }
        
        setIsLoading(false);
    }, []);

    return (
        <AuthContext.Provider value={{
            email: user?.email ?? '',
            user,
            token,
            isAuthenticated: !!token,
            email: user?.email || '',
            isLoading,
            login,
            logout
        }}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};

export default AuthContext;