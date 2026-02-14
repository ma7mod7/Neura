import { createContext, useState, useEffect, ReactNode } from 'react';
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
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (authData: AuthResponse) => void;
    logout: () => void;
}

// 2. إنشاء الـ Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);


    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        const isValidToken = storedToken && storedToken !== "undefined" && storedToken !== "null";
        const isValidUser = storedUser && storedUser !== "undefined" && storedUser !== "null";

        if (isValidToken && isValidUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setToken(storedToken);
                setUser(parsedUser);
                axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
            } catch (error) {
                console.error("Error parsing user from storage", error);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        }
        setIsLoading(false);
    }, []);

    const login = (authData: AuthResponse) => {
        const { token,
            refreshToken,
            expiresin,
            refreshTokenExpiration, ...userData } = authData;
        setToken(token);
        setUser(userData);

        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(userData));

        
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    };

    // 5. دالة تسجيل الخروج
    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            isAuthenticated: !!token,
            isLoading,
            login,
            logout
        }}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};

export default AuthContext;