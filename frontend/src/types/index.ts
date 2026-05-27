export interface User {
    id: string;
    name: string;
    profile_picture: string | null;
}

export interface Message {
    id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    created_at: string;
    read: boolean;
}

export interface Chat {
    other_id: string;
    last_message: string;
    last_at: string;
    unread_count: number;
}

export type ConnectionStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED';

export interface Connection {
    id: string;
    sender_id: string;
    receiver_id: string;
    status: ConnectionStatus;
    created_at: string;
}