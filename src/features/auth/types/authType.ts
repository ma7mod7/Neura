// features/auth/types.ts

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    user: User;
}

export interface User {
    id: string;
    username: string;
    email: string;
    name?: string;
    avatar?: string;
    role?: string;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}

export interface SocialLoginProvider {
    provider: 'google' | 'github';
    redirectUrl?: string;
}