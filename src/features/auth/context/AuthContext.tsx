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
    };

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        const storedExpiration = localStorage.getItem('tokenExpiration'); 

        const isValidToken = storedToken && storedToken !== "undefined" && storedToken !== "null";
        const isValidUser = storedUser && storedUser !== "undefined" && storedUser !== "null";

        if (isValidToken && isValidUser && storedExpiration) {
            const currentTime = new Date().getTime();
            const expirationTime = parseInt(storedExpiration, 10);

            // 2. التحقق مما إذا كان التوكن قد انتهى
            if (currentTime > expirationTime) {
                logout();
                setIsLoading(false);
                return;
            }

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
            logout();
        }
        setIsLoading(false);
    }, []);

    const login = (authData: AuthResponse) => {
        const { token, refreshToken, expiresin, ...userData } = authData;
    
        const expirationTime = new Date().getTime() + (expiresin * 60 * 1000); 

        setToken(token);
        setUser(userData);

        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('tokenExpiration', expirationTime.toString()); 

        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
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