import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../api";
import { useAuth } from "../../hooks/useAuth";
import { useWS } from "../../context/WebSocketContext";
import { Message } from "../../types";

export default function ChatView() {
    const { userId } = useParams<{ userId: string }>();
    const {userId: myId } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [otherTyping, setOtherTyping] = useState(false);
    const [otherOnline, setOtherOnline] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const { send, subscribe } = useWS();

    useEffect(() => {
        return subscribe((msg: unknown) => {
            const m = msg as { type: string; message?: Message; from?: string; isTyping?: boolean; userId?: string; online?: boolean };
            if (m.type === "message" && m.message) {
                setMessages(prev => [...prev, m.message!]);
            }
            if (m.type === "typing" && m.from === userId) {
                setOtherTyping(m.isTyping ?? false);
            }
            if (m.type === "online" && m.userId === userId) {
                setOtherOnline(m.online ?? false);
            }
        });
    }, [subscribe, userId]);

    useEffect(() => {
        if (!userId) return;
        api.getMessages(userId).then(setMessages).catch(console.error);
    }, [userId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    function handleTyping(e: React.ChangeEvent<HTMLInputElement>) {
        setInput(e.target.value);
        if (!isTyping) {
            setIsTyping(true);
            send({ type: "typing", to: userId, isTyping: true });
        }
        if (typingTimer.current) clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(() => {
            setIsTyping(false);
            send({ type: "typing", to: userId, isTyping: false });
        }, 1500);
    }

    async function handleSend(e: React.FormEvent) {
        e.preventDefault();
        if (!input.trim() || !userId) return;
        send({ type: "message", to: userId, content: input });
        setInput("");
    }

    return (
        <div className="d-flex flex-column" style={{ height: 'calc(100vh - 60px)' }}>
            <div className="d-flex align-items-center gap-2 px-3 py-2 border-bottom">
                <span className={`online-dot ${otherOnline ? "online" : "offline"}`} />
                <span className="text-muted small">{otherOnline ? "Online" : "Offline"}</span>
            </div>
            <div className="flex-grow-1 overflow-y-auto p-3 d-flex flex-column gap-2">
                <div className="flex-grow-1" />
                {messages.map(msg => (
                    <div
                        key={msg.id}
                        className={msg.sender_id === myId
                            ? "align-self-end bg-light text-dark px-3 py-2 rounded-4"
                            : "align-self-start bg-body-secondary px-3 py-2 rounded-4 border"
                        }
                        style={{ maxWidth: '70%', wordBreak: 'break-word', flexShrink: 0 }}
                    >
                        <span className="d-block text-muted" style={{ fontSize: '0.7rem', marginTop: '0.25rem' }}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <p>{msg.content}</p>
                    </div>
                ))}
                {otherTyping && <div className="text-muted small px-2">typing...</div>}
                <div ref={bottomRef} />
            </div>
            <form className="d-flex gap-2 p-3 border-top" onSubmit={handleSend}>
                <input
                    className="form-control rounded-pill"
                    value={input}
                    onChange={handleTyping}
                    placeholder="Type a message..."
                    autoFocus
                />
                <button className="btn btn-primary rounded-pill px-4" type="submit">Send</button>
            </form>
        </div>
    );
}
