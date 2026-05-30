import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";
import { useWS } from "../../context/WebSocketContext";
import { Chat, User } from "../../types";

export default function ChatList() {
    const [chats, setChats] = useState<Chat[]>([]);
    const [userProfiles, setUserProfiles] = useState<Record<string, { name: string, avatar: string | null }>>({});
    const navigate = useNavigate();
    const { subscribe } = useWS();

    function loadChats() {
        api.getChats().then((data: Chat[]) => {
            setChats(data);
            data.forEach(chat => {
                api.getUser(chat.other_id)
                    .then((u: User) => setUserProfiles(prev => ({ ...prev, [chat.other_id]: { name: u.name, avatar: u.profile_picture } })))
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
                {chats.map(chat => {
                    const profile = userProfiles[chat.other_id] || { name: chat.other_id, avatar: null };
                    
                    return (
                        <div key={chat.other_id} className="card card-body" onClick={() => navigate(`/chat/${chat.other_id}`)} style={{ cursor: 'pointer' }}>
                            <div className="d-flex align-items-center gap-3">
                                <div className="rounded-circle bg-primary bg-opacity-25 text-primary fw-semibold d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 46, height: 46, overflow: 'hidden' }}>
                                    {/* FIX: Render the image if it exists, otherwise fallback to initials */}
                                    {profile.avatar ? (
                                        <img src={profile.avatar} alt={profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        profile.name.substring(0, 2).toUpperCase()
                                    )}
                                </div>
                                
                                <div className="flex-grow-1 min-w-0">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <span className="fw-semibold text-truncate">{profile.name}</span>
                                        <span className="text-secondary small ms-2 text-nowrap">
                                            {new Date(chat.last_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className="text-muted small text-truncate pe-3">{chat.last_message}</span>
                                        {chat.unread_count > 0 && (
                                            <span className="badge bg-primary rounded-pill">{chat.unread_count}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}