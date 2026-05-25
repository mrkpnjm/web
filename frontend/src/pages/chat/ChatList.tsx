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
        <div className="page">
            <h2>Messages</h2>
            {chats.length === 0 && <p className="empty">No conversations yet.</p>}
            <ul className="chat-list">
                {chats.map(chat => (
                    <li key={chat.other_id} onClick={() => navigate(`/chat/${chat.other_id}`)}>
                        <div className="chat-info">
                            <span className="chat-name">{userNames[chat.other_id] ?? chat.other_id}</span>
                            <span className="chat-preview">{chat.last_message}</span>
                        </div>
                        <div className="chat-meta">
                            <span className="chat-time">
                                {new Date(chat.last_at).toLocaleDateString()}
                            </span>
                            {chat.unread_count > 0 && (
                                <span className="unread-badge">{chat.unread_count}</span>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
