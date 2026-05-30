import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../api";

interface UserInfo {
    name: string;
    profile_picture: string | null;
}
interface ProfileData {
    display_name: string;
    avatar_url: string | null;
    about_me: string;
}
interface BioData {
    age: number;
    gender: string;
    music_genre: string;
    looking_for: string;
    activity_level: string;
    location_id: number;
}
interface Location {
    id: number;
    city: string;
    country: string;
}

export default function UserProfilePage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [user, setUser] = useState<UserInfo | null>(null);
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [bio, setBio] = useState<BioData | null>(null);
    const [locations, setLocations] = useState<Location[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!id) return;
        Promise.all([
            api.getUser(id),
            api.getProfile(id).catch(() => null),
            api.getUserBio(id).catch(() => null),
            api.getLocations(),
            api.getActiveConnections(),
        ])
            .then(([u, p, b, locs, connections]) => {
                setUser(u);
                setProfile(p);
                setBio(b);
                setLocations(locs);
                setIsConnected((connections as string[]).includes(id));
            })
            .catch(() => setError("Could not load profile."))
            .finally(() => setLoading(false));
    }, [id]);

    const getCityName = (locationId: number) => {
        const loc = locations.find((l) => l.id === locationId);
        return loc ? `${loc.city} (${loc.country})` : "Unknown";
    };

    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

    if (loading) return <div className="container py-4 text-muted">Loading profile...</div>;
    if (error) return <div className="container py-4 text-danger">{error}</div>;

    const displayName = profile?.display_name || user?.name || "Unknown";
    const avatar = profile?.avatar_url || user?.profile_picture;

    return (
        <div className="container py-4">
            <button className="btn btn-link text-muted ps-0 mb-3" onClick={() => navigate(-1)}>
                ← Back
            </button>
            <div className="card p-4 mx-auto" style={{ maxWidth: "640px" }}>
                <div className="d-flex align-items-center gap-4 pb-4 border-bottom">
                    <div
                        className="rounded-circle bg-body-secondary border d-flex align-items-center justify-content-center flex-shrink-0 fw-bold text-muted"
                        style={{ width: 100, height: 100, fontSize: "2rem", overflow: "hidden" }}
                    >
                        {avatar ? (
                            <img
                                className="rounded-circle"
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                src={avatar}
                                alt={displayName}
                            />
                        ) : (
                            <span>{displayName.substring(0, 2).toUpperCase()}</span>
                        )}
                    </div>
                    <div className="flex-grow-1">
                        <h4 className="mb-1">{displayName}</h4>
                        {bio && (
                            <p className="text-muted small mb-0">
                                {bio.age} years old &bull; {getCityName(bio.location_id)}
                            </p>
                        )}
                    </div>
                    {isConnected && (
                        <a href={`/chat/${id}`} className="btn btn-primary ms-auto">
                            Message
                        </a>
                    )}
                </div>

                <div className="d-flex flex-column gap-3 mt-4">
                    {profile?.about_me && (
                        <div>
                            <p className="text-muted small text-uppercase mb-2">About Me</p>
                            <p className="p-3 rounded bg-body-secondary border text-muted">{profile.about_me}</p>
                        </div>
                    )}
                    {bio && (
                        <div className="row g-3">
                            <div className="col-6">
                                <div className="p-3 rounded bg-body-secondary border h-100">
                                    <span className="text-muted d-block mb-1" style={{ fontSize: "0.75rem", textTransform: "uppercase" }}>Gender</span>
                                    <span className="fw-semibold">{capitalize(bio.gender)}</span>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="p-3 rounded bg-body-secondary border h-100">
                                    <span className="text-muted d-block mb-1" style={{ fontSize: "0.75rem", textTransform: "uppercase" }}>Looking For</span>
                                    <span className="fw-semibold">{capitalize(bio.looking_for)}</span>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="p-3 rounded bg-body-secondary border h-100">
                                    <span className="text-muted d-block mb-1" style={{ fontSize: "0.75rem", textTransform: "uppercase" }}>Music</span>
                                    <span className="fw-semibold">🎵 {capitalize(bio.music_genre)}</span>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="p-3 rounded bg-body-secondary border h-100">
                                    <span className="text-muted d-block mb-1" style={{ fontSize: "0.75rem", textTransform: "uppercase" }}>Activity</span>
                                    <span className="fw-semibold">⚡ {capitalize(bio.activity_level)}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
