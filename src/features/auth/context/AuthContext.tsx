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
    imageUrl: string;
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
    updateUser: (updatedData: Partial<User>) => void;
    refreshUser: () => Promise<void>; 
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
        const { token, refreshToken, expiresin,refreshTokenExpiration, ...userData } = authData;
        const normalizedUser: User = {
            ...userData,
            userName: (userData as any).username 
            ?? userData.userName 
            ?? userData.firstName  // fallback for social login
            ?? userData.email?.split('@')[0]  // last resort
            ?? 'User',
        };
        const expirationTime = new Date().getTime() + (expiresin * 1000);
        setToken(token);
        setUser(normalizedUser);
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(normalizedUser));
        localStorage.setItem('tokenExpiration', expirationTime.toString());
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    };

    const updateUser = (updatedData: Partial<User>) => {
        setUser((prevUser) => {
            if (!prevUser) return null;
            const newUser = { ...prevUser, ...updatedData };
            localStorage.setItem('user', JSON.stringify(newUser));
            return newUser;
        });
    };

    const refreshUser = async () => {
        const storedRefreshToken = localStorage.getItem('refreshToken');
        if (!storedRefreshToken) return;
        try {
            const response = await axios.post('/Auth/refresh', { refreshToken: storedRefreshToken });
            login(response.data);
        } catch (e) {
            console.error('Failed to refresh token', e);
        }
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

            if (currentTime > expirationTime) {
                if (storedRefreshToken) {
                    axios.post('/Auth/refresh', { refreshToken: storedRefreshToken })
                        .then(response => login(response.data))
                        .catch(error => {
                            console.error("Session expired.", error);
                            logout();
                        })
                        .finally(() => setIsLoading(false));
                    return;
                } else {
                    logout();
                    setIsLoading(false);
                    return;
                }
            }

            try {
                const parsedUser = JSON.parse(storedUser!);
                const normalizedUser: User = {
                    ...parsedUser,
                    userName: parsedUser.username ?? parsedUser.userName,
                };
                setToken(storedToken);
                setUser(normalizedUser);
                axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
            } catch (error) {
                console.error("Error parsing user from storage", error);
                logout();
            }
        } else {
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
            isLoading,
            login,
            logout,
            updateUser,
            refreshUser, 
        }}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};

export default AuthContext;