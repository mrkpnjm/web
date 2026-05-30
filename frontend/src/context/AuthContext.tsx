import { createContext, useEffect, useState, ReactNode } from "react";
import { api } from "../api";

interface AuthContextType {
    token: string | null;
    userId: string | null;
    isLoggedIn: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password:string) => Promise<void>;
    logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        if (token) {
            api.getMe().then(me => setUserId(me.id)).catch(() => {});
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function login(email:string, password: string) {
        const data = await api.login(email, password);
        localStorage.setItem('token', data.token);
        setToken(data.token);
        const me = await api.getMe();
        setUserId(me);
    }

    async function register(email:string, password: string) {
        const data = await api.register(email, password);
        localStorage.setItem('token', data.token);
        setToken(data.token);
        const me = await api.getMe();
        setUserId(me);
    }

    async function logout() {
        try {
            await api.logout();
        } catch (error) {
            console.error("Logout API failed", error);
        } finally {
            localStorage.removeItem('token');
            setToken(null); // This instantly broadcasts the null token to the entire app
            setUserId(null);
        }
    }

    return (
        <AuthContext.Provider value={{ token, userId, isLoggedIn: !!token, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};