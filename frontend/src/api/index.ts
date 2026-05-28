const BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

function getToken() {
    return localStorage.getItem("token");
}

async function request(path: string, options: RequestInit = {}) {
    const res = await fetch(`${BASE}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
            ...options.headers,
        },
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || res.statusText);
    }

    // FIX: Prevents a JSON parsing crash on 204 No Content responses (like DELETE requests)
    if (res.status === 204) return null;

    return res.json();
}

export const api = {
    register: (email: string, password: string) =>
        request("/auth/register", { method: "POST", body: JSON.stringify({ email, password }) }),

    login: (email: string, password: string) =>
        request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),

    logout: () =>
        request("/auth/logout", { method: "POST" }),

    getChats: () =>
        request("/chats"),

    getMessages: (userId: string, page = 1) =>
        request(`/chats/${userId}?page=${page}`),

    sendMessage: (userId: string, content: string) =>
        request(`/chats/${userId}`, { method: "POST", body: JSON.stringify({ content }) }),

    getUser: (id: string) =>
        request(`/users/${id}`),

    getMe: () =>
        request("/me"),
    
    // --- Profile & Recommendation Endpoints ---
    
    getMyProfile: () =>
        request("/me/profile"),

    updateMyProfile: (profileData: any) =>
        request("/me/profile", { method: "PUT", body: JSON.stringify(profileData) }),

    getProfile: (id: string) =>
        request(`/users/${id}/profile`),
        
    getRecommendations: () =>
        request("/recommendations"),

    dismissRecommendation: (id: string) =>
        request(`/recommendations/${id}/dismiss`, { method: "POST" }),

    // --- Secure Connection Endpoints ---

    getActiveConnections: () =>
        request("/connections/active"),
    
    getPendingRequests: () =>
        request("/connections/pending"),

    sendConnectionRequest: (targetUserId: string) =>
        request(`/connections/request?targetUserId=${targetUserId}`, { method: "POST" }),

    acceptConnectionRequest: (requesterId: string) =>
        request(`/connections/accept?requesterId=${requesterId}`, { method: "POST" }),

    dismissConnectionRequest: (requesterId: string) =>
        request(`/connections/dismiss?requesterId=${requesterId}`, {method: "POST" }),

    removeConnection: (connectedUserId: string) =>
        request(`/connections/remove?connectedUserId=${connectedUserId}`, { method: "DELETE" }),
    
    getLocations: () => request("/locations"),
};
