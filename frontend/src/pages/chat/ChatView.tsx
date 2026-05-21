import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../api";
import { useWebSocket } from "../../hooks/useWebSocket";
import { Message } from "../../types";

export default function ChatView() {
    const { userId } = useParams<{ userId: string }>();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [otherTyping, setOtherTyping] = useState(false);
    const token = localStorage.getItem("token");
    const bottomRef = useRef<HTMLDivElement>(null);
    const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const { send } = useWebSocket(token, (msg: unknown) => {
        const m = msg as { type: string; message?: Message; from?: string; isTyping?: boolean };
        if (m.type === "message" && m.message) {
            setMessages(prev => [...prev, m.message!]);
        }
        if (m.type === "typing" && m.from === userId) {
            setOtherTyping(m.isTyping ?? false);
        }
    });

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

    const myId = token ? JSON.parse(atob(token.split(".")[1])).id : null;

    return (
        <div className="chat-view">
            <div className="messages">
                {messages.map(msg => (
                    <div
                        key={msg.id}
                        className={`message ${msg.sender_id === myId ? "mine" : "theirs"}`}
                    >
                        <p>{msg.content}</p>
                        <span className="msg-time">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                    </div>
                ))}
                {otherTyping && <div className="typing-indicator">typing...</div>}
                <div ref={bottomRef} />
            </div>
            <form className="message-form" onSubmit={handleSend}>
                <input
                    value={input}
                    onChange={handleTyping}
                    placeholder="Type a message..."
                    autoFocus
                />
                <button type="submit">Send</button>
            </form>
        </div>
    );
}
