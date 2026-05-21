import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";
import { Chat } from "../../types";

export default function ChatList() {
    const [chats, setChats] = useState<Chat[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        api.getChats().then(setChats).catch(console.error);
    }, []);

    return (
        <div className="page">
            <h2>Messages</h2>
            {chats.length === 0 && <p className="empty">No conversations yet.</p>}
            <ul className="chat-list">
                {chats.map(chat => (
                    <li key={chat.other_id} onClick={() => navigate(`/chat/${chat.other_id}`)}>
                        <div className="chat-info">
                            <span className="chat-name">{chat.other_id}</span>
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
