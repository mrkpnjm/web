import { createContext, useState, ReactNode } from "react";
import { api } from "../api";

interface AuthContextType {
    token: string | null;
    isLoggedIn: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password:string) => Promise<void>;
    logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

    async function login(email:string, password: string) {
        const data = await api.login(email, password);
        localStorage.setItem('token', data.token);
        setToken(data.token);        
    }

    async function register(email:string, password: string) {
        const data = await api.register(email, password);
        localStorage.setItem('token', data.token);
        setToken(data.token);
    }

    async function logout() {
        try {
            await api.logout();
        } catch (error) {
            console.error("Logout API failed", error);
        } finally {
            localStorage.removeItem('token');
            setToken(null); // This instantly broadcasts the null token to the entire app
        }
    }

    return (
        <AuthContext.Provider value={{ token, isLoggedIn: !!token, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};