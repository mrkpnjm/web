import { useEffect, useState, useCallback } from "react";
import { api } from "../../api";

export function ConnectionsPage() {
  const [activeConnections, setActiveConnections] = useState<string[]>([]);
  const [pendingRequests, setPendingRequests] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>("");
  const [userProfiles, setUserProfiles] = useState<Record<string, { name: string, avatar: string | null }>>({});
  const [activeTab, setActiveTab] = useState<"active" | "requests">("active");

  const loadConnectionsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [active, pending] = await Promise.all([
        api.getActiveConnections(),
        api.getPendingRequests(),
      ]);

      setActiveConnections(active);
      setPendingRequests(pending);

      const uniqueIds = [...new Set([...active, ...pending])] as string[];

      const profileEntries = await Promise.all(
        uniqueIds.map(async (id: string) => {
          const user = await api.getUser(id).catch(() => null);
          return [id, { name: user?.name ?? id, avatar: user?.profile_picture ?? null }];
        }),
      );

      setUserProfiles(Object.fromEntries(profileEntries));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "Failed to load connections");
    } finally {
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
  };

  const handleDismiss = async (requesterId: string) => {
    try {
      await api.dismissConnectionRequest(requesterId);
      setPendingRequests((prev) => prev.filter((id) => id !== requesterId));
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Failed to dismiss request");
    }
  };

  const handleRemove = async (connectedUserId: string) => {
    try {
      await api.removeConnection(connectedUserId);
      setActiveConnections((prev) => prev.filter((id) => id !== connectedUserId));
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Failed to remove connection");
    }
  };

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading)
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" />
        <p className="mt-2 text-muted">Loading connections...</p>
      </div>
    );

  if (error)
    return (
      <div className="container mt-4">
        <div className="alert alert-danger d-flex justify-content-between align-items-center">
          <span>{error}</span>
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={loadConnectionsData}
          >
            Retry
          </button>
        </div>
      </div>
    );

  return (
    <div className="container mt-4">
      <h2 className="fw-semibold mb-1">Connections</h2>
      <p className="text-muted mb-4">
        Manage your active connections and incoming requests
      </p>

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "active" ? "active" : ""}`}
            onClick={() => setActiveTab("active")}
          >
            Active
            {activeConnections.length > 0 && (
              <span className="badge badge-purple ms-2">
                {activeConnections.length}
              </span>
            )}
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "requests" ? "active" : ""}`}
            onClick={() => setActiveTab("requests")}
          >
            Requests
            {pendingRequests.length > 0 && (
              <span className="badge badge-amber ms-2">
                {pendingRequests.length}
              </span>
            )}
          </button>
        </li>
      </ul>

      {activeTab === "active" &&
        (activeConnections.length === 0 ? (
          <p className="text-muted">
            No active connections yet. Head to{" "}
            <a href="/recommendations">Discover</a>.
          </p>
        ) : (
          <div className="d-flex flex-column gap-3">
            {activeConnections.map((otherId) => {
              const profile = userProfiles[otherId] ?? { name: otherId, avatar: null };
              return (
                <div key={otherId} className="card">
                  <div className="card-body d-flex align-items-center gap-3">
                    <div
                      className="rounded-circle bg-primary bg-opacity-25 text-primary fw-semibold d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: 46, height: 46, overflow: 'hidden' }}
                    >
                      {/* Render the image if it exists, otherwise fallback to initials */}
                      {profile.avatar ? (
                          <img src={profile.avatar} alt={profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                          getInitials(profile.name)
                      )}
                    </div>
                    <div className="flex-grow-1">
                      <p className="mb-0 fw-medium">{profile.name}</p>
                    </div>
                    <div className="d-flex gap-2 flex-shrink-0">
                      <a
                        href={`/chat/${otherId}`}
                        className="btn btn-outline-secondary"
                      >
                        Message
                      </a>
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => handleRemove(otherId)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

      {activeTab === "requests" &&
        (pendingRequests.length === 0 ? (
          <p className="text-muted">No pending requests</p>
        ) : (
          <div className="d-flex flex-column gap-3">
            {pendingRequests.map((senderId) => {
              const profile = userProfiles[senderId] ?? { name: senderId, avatar: null };
              return (
                <div key={senderId} className="card border-warning">
                  <div className="card-body d-flex align-items-center gap-3">
                    <div
                      className="rounded-circle bg-warning bg-opacity-25 text-warning fw-semibold d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: 46, height: 46, overflow: 'hidden' }}
                    >
                      {/* Render the image if it exists, otherwise fallback to initials */}
                      {profile.avatar ? (
                          <img src={profile.avatar} alt={profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                          getInitials(profile.name)
                      )}
                    </div>
                    <div className="flex-grow-1">
                      <p className="mb-0 fw-medium">
                        {profile.name}
                        <span className="badge bg-warning text-dark ms-2">
                          Pending
                        </span>
                      </p>
                    </div>
                    <div className="d-flex gap-2 flex-shrink-0">
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleAccept(senderId)}
                      >
                        Accept
                      </button>
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => handleDismiss(senderId)}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
    </div>
  );
}