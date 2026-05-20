import { useState } from "react";
import { api } from "../api";

export function useAuth() {
    const [token, setToken] = useState<string | null>(localStorage.getItem("token"));

    async function login(email: string, password: string) {
        const data = await api.login(email, password);
        localStorage.setItem("token", data.token);
        setToken(data.token);
    }

    async function register(email: string, password: string) {
        const data = await api.register(email, password);
        localStorage.setItem("token", data.token);
        setToken(data.token);
    }

    async function logout() {
        await api.logout();
        localStorage.removeItem("token");
        setToken(null);
    }

    return { token, isLoggedIn: !!token, login, register, logout };
}
