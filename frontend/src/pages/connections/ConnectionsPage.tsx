import { useEffect, useState, useCallback } from "react";
import { ConnectionStatus, Connection } from "../../types";
import { api } from "../../api";

export function ConnectionsPage() {
    const [activeConnections, setActiveConnections] = useState<Connection[]>([]);
    const [pendingRequests, setPendingRequests] = useState<Connection[]>([]);
    const [myId, setMyId] = useState<string | null>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>('');
    const [userNames, setUserNames] = useState<Record<string, string>>({});
    const [activeTab, setActiveTab] = useState<'active' | 'requests'>('active');

    const loadConnectionsData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null)

            const [me, active, pending] = await Promise.all([
                api.getMe(),
                api.getActiveConnections(),
                api.getPendingRequests()
            ]);

            setMyId(me.id);
            setActiveConnections(active);
            setPendingRequests(pending);
        } catch (err: any) {
            setError(err.message || "Failed to load connections");
        }
        finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadConnectionsData();
    }, [loadConnectionsData]);







}