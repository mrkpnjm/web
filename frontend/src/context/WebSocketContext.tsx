import { createContext, useContext, useEffect, useRef, useCallback } from "react";

type Handler = (msg: unknown) => void;

interface WSContextType {
    send: (payload: unknown) => void;
    subscribe: (handler: Handler) => () => void;
}

const WebSocketContext = createContext<WSContextType>({
    send: () => {},
    subscribe: () => () => {},
});

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8080/ws/chat";

export function WebSocketProvider({ token, children }: { token: string | null; children: React.ReactNode }) {
    const ws = useRef<WebSocket | null>(null);
    const handlers = useRef<Set<Handler>>(new Set());

    useEffect(() => {
        if (!token) return;

        let isMounted = true;
        const socket = new WebSocket(`${WS_URL}?token=${token}`);
        ws.current = socket;

        // 1. Wait for the connection to open
        socket.onopen = () => {
            // If React unmounted this component while the socket was connecting
            // close it immediately now that it's safe to do seo.
            if (!isMounted) {
                socket.close();
            }
        }

        socket.onmessage = (e) => {
            try {
                const msg = JSON.parse(e.data);
                handlers.current.forEach(h => h(msg));
            } catch {}
        };

        return () => {
            isMounted = false;

            // 2. Only close synchronously if the connection is already fully established
            if (socket.readyState === WebSocket.OPEN) {
                socket.close();
            }
        };
    }, [token]);

    const send = useCallback((payload: unknown) => {
        if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify(payload));
        }
    }, []);

    const subscribe = useCallback((handler: Handler) => {
        handlers.current.add(handler);
        return () => { handlers.current.delete(handler); };
    }, []);

    return (
        <WebSocketContext.Provider value={{ send, subscribe }}>
            {children}
        </WebSocketContext.Provider>
    );
}

export function useWS() {
    return useContext(WebSocketContext);
}
