import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";
import { useWS } from "../../context/WebSocketContext";
import { Chat, User } from "../../types";

export default function ChatList() {
    const [chats, setChats] = useState<Chat[]>([]);
    const [userNames, setUserNames] = useState<Record<string, string>>({});
    const navigate = useNavigate();
    const { subscribe } = useWS();

    function loadChats() {
        api.getChats().then((data: Chat[]) => {
            setChats(data);
            data.forEach(chat => {
                api.getUser(chat.other_id)
                    .then((u: User) => setUserNames(prev => ({ ...prev, [chat.other_id]: u.name })))
                    .catch(() => {});
            });
        }).catch(console.error);
    }

    useEffect(() => { loadChats(); }, []);

    useEffect(() => {
        return subscribe((msg: unknown) => {
            const m = msg as { type: string };
            if (m.type === "message") loadChats();
        });
    }, [subscribe]);

    return (
        <div className="container py-4">
            <h2 className="mb-4">Messages</h2>
            {chats.length === 0 && <p className="text-muted">No conversations yet.</p>}
            <div className="d-flex flex-column gap-2">
                {chats.map(chat => (
                    <div key={chat.other_id} className="card card-body d-flex flex-column gap-1" onClick={() => navigate(`/chat/${chat.other_id}`)} style={{ cursor: 'pointer' }}>
                        <div className="d-flex justify-content-between align-items-center">
                            <span className="fw-semibold">{userNames[chat.other_id] ?? chat.other_id}</span>
                            <span className="text-secondary small">
                                {new Date(chat.last_at).toLocaleDateString()}
                            </span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                            <span className="text-muted small text-truncate" style={{ maxWidth: '70%' }}>{chat.last_message}</span>
                            {chat.unread_count > 0 && (
                                <span className="badge bg-light text-dark rounded-pill">{chat.unread_count}</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
