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

            const allIds = [
                active.map((c: Connection) => c.sender_id === me.id ? c.receiver_id : c.sender_id),
                pending.map((c: Connection) => c.sender_id)
            ]

            const uniqueIds = [...new Set(allIds.flat())];

            const nameEntries = await Promise.all(
                uniqueIds.map(async (id: string) => {
                    const user = await api.getUser(id).catch(() => null);
                    return [id, user?.name ?? id] as [string, string];                    
                })
            );

            setUserNames(Object.fromEntries(nameEntries));
                
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            setError(message || "Failed to load connections");
        }
        finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadConnectionsData();
    }, [loadConnectionsData]);

    const handleAccept = async (requesterId: string) => {
        try {
            await api.acceptConnectionRequest(requesterId);
            await loadConnectionsData();
        } catch (err: unknown) {
            if (err instanceof Error) setError(err.message);
            else setError("Failed to accept request");
        }
    }

    const handleDismiss = async (requesterId: string) => {
        try {
            await api.dismissConnectionRequest(requesterId);
            setPendingRequests(prev => prev.filter(r => r.sender_id != requesterId));
        } catch (err: unknown) {
            if (err instanceof Error) setError(err.message);
            else setError("Failed to dismiss request");
        }
    }

    const handleRemove = async (connectedUserId: string) => {
        try {
            await api.removeConnection(connectedUserId);
            setActiveConnections(prev => prev.filter(c => c.sender_id != connectedUserId && c.receiver_id != connectedUserId));
        } catch (err: unknown) {
            if (err instanceof Error) setError(err.message);
            else setError("Failed to remove connection");
        }
    }

    const getInitials = (name: string): string => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }

    if (loading) return (
        <div className="container mt-5 text-center">
            <div className="spinner-border text-primary" />
            <p className="mt-2 text-muted">Loading connections...</p> 
        </div>
    );

    if (error) return (
        <div className="container mt-4">
            <div className="alert alert-danger d-flex justify-content-between align-items-center">
                <span>{error}</span>
                <button className="btn btn-sm btn-outline-danger" onClick={loadConnectionsData}>
                    Retry
                </button>
            </div>
        </div>
    );

    return (
        <div className="container mt-4">
            <h2 className="fw-semibold mb-1">Connections</h2>
            <p className="text-muted mb-4">Manage your active connections and incoming requests</p>

            <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'active' ? 'active' : ''}`}
                        onClick={() => setActiveTab('active')}
                    >
                        Active
                        {activeConnections.length > 0 && (
                            <span className="badge bg-primary ms-2">{activeConnections.length}</span>
                        )}
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'requests' ? 'active' : ''}`}
                        onClick={() => setActiveTab('requests')}
                    >
                        Requests
                        {pendingRequests.length > 0 && (
                            <span className="badge bg-warning text-dark ms-2">{pendingRequests.length}</span>
                        )}
                    </button>
                </li>
            </ul>

            {activeTab === 'active' && (
                activeConnections.length === 0 
                ? <p className="text-muted">No active connections yet. Head to <a href="/recommendations">Discover</a>.</p>
                : <div className="">
                    {activeConnections.map(conn => {
                        const otherId = conn.sender_id === myId ? conn.receiver_id : conn.sender_id;
                        const name = userNames[otherId] ?? otherId;
                        return (
                            <div key={conn.id} className="card">
                                <div className="card-body">
                                    <div className="d-flex align-items-center gap-3">

                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {activeTab === 'requests' && (
                pendingRequests.length === 0
                ? <p className="text-muted">No pending requests</p>
                : <div className="d-flex flex-column gap-3">
                    {pendingRequests.map(req => {
                        const otherId = req.receiver_id === myId ? req.sender_id : req.receiver_id;
                        const name = userNames[otherId] ?? otherId;
                        return (
                            <div key={req.sender_id} className="card border-warning">
                                <div className="card-body d-flex align-items-center gap-3">
                                    <div
                                        className="rounded-circle bg-warning bg-opacity-25 text-warning fw-semibold d-flex align-items-center justify-content-center flex-shrink-0"
                                        style={{ width: 46, height: 46 }}
                                    >
                                        {getInitials(name)}
                                    </div>
                                    <div className="flex-grow-1">
                                        <p className="mb-0 fw-medium">
                                            {name}
                                            <span className="badge bg-warning text-dark ms-2">Pending</span>
                                        </p>
                                        <p className="mb-0 text-muted small">
                                            Sent {new Date(req.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="d-flex gap-2 flex-shrink-0">
                                        <button className="btn btn-success btn-sm" onClick={() => handleAccept(req.sender_id)}>
                                            Accept
                                        </button>
                                        <button className="btn btn-outline-secondary btn-sm" onClick={() => handleDismiss(req.sender_id)}>
                                            Decline
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}

                </div>
            )}
        </div>
    );









}