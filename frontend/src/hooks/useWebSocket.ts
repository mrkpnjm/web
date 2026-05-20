import { useEffect, useRef, useCallback } from "react";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:3000";

type Handler = (msg: unknown) => void;

export function useWebSocket(token: string | null, onMessage: Handler) {
    const ws = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (!token) return;
        const socket = new WebSocket(`${WS_URL}?token=${token}`);
        ws.current = socket;

        socket.onmessage = (e) => {
            try { onMessage(JSON.parse(e.data)); } catch {}
        };

        return () => socket.close();
    }, [token]);

    const send = useCallback((payload: unknown) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify(payload));
        }
    }, []);

    return { send };
}
