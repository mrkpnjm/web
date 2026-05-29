import { useEffect, useState } from "react";
import { api } from "../../api";

interface DetailedProfile {
    id: string;
    name: string;
    avatar_url: string | null;
    bio: string;
    age: number;
    gender: string;
    musicGenre: string;
    activityLevel: string;
    locationId: string;
    lookingFor: string;
}

interface Location {
    id: number;
    city: string;
    country: string;
}

export default function Recommendations() {
    const [recommendations, setRecommendations] = useState<DetailedProfile[]>([]);
    const [locations, setLocations] = useState<Location[]>([]); 
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            try {
                // Fetch locations directly, no need for getMe() anymore
                const locs = await api.getLocations();
                setLocations(locs);
                await loadRecommendations();
            } catch (err) {
                console.error("Initialization failed", err);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    // Helper to find location name dynamically
    const getCityName = (id: string) => {
        const loc = locations.find(l => l.id.toString() === id);
        return loc ? `${loc.city} (${loc.country})` : "Unknown Location";
    };

    const loadRecommendations = async () => {
        try {
            const ids: string[] = await api.getRecommendations();
            const details = await Promise.all(
                ids.map(async (id) => {
                    try {
                        const [userBase, userProfile] = await Promise.all([
                            api.getUser(id),
                            api.getProfile(id)
                        ]);
                        return {
                            id: id,
                            name: userBase.name,
                            avatar_url: userBase.profile_picture,
                            bio: userProfile.bio,
                            age: userProfile.age,
                            gender: userProfile.gender,
                            // Properly mapped from backend snake_case
                            musicGenre: userProfile.music_genre,
                            activityLevel: userProfile.activity_level,
                            locationId: userProfile.location_id?.toString() || "0",
                            lookingFor: userProfile.looking_for || "Not specified"
                        };
                    } catch (err: unknown) {
                        console.error("Failed to load profile for id", id, err);
                        return null;
                    }
                })
            );
            setRecommendations(details.filter((p) => p !== null) as DetailedProfile[]);
        } catch (error) {
            console.error("Error loading recommendations:", error);
        }
    };

    const handleConnect = async (receiverId: string) => {
        try {
            await api.sendConnectionRequest(receiverId);
            setRecommendations(prev => prev.filter(p => p.id !== receiverId));
        } catch (error) {
            alert(error instanceof Error ? error.message : "Failed to connect");
        }
    };

    const handleDismiss = async (dismissedId: string) => {
        try {
            await api.dismissRecommendation(dismissedId);
            setRecommendations(prev => prev.filter(p => p.id !== dismissedId));
        } catch (error) {
            console.error("Failed to dismiss:", error);
        }
    };

    if (loading) return <div className="page">Loading recommendations...</div>;

    return (
        <div className="page recommendations-page">
            <h2>Discover Connections</h2>
            {recommendations.length === 0 ? (
                <p className="empty">No recommendations available. Complete your profile or change preferences.</p>
            ) : (
                <div className="recommendations-grid">
                    {recommendations.map((rec) => (
                        <div key={rec.id} className="rec-card">
                            <div className="rec-avatar-container">
                                {rec.avatar_url ? (
                                    <img src={rec.avatar_url} alt={rec.name} className="rec-avatar" />
                                ) : (
                                    <div className="rec-avatar-placeholder">{rec.name[0]?.toUpperCase()}</div>
                                )}
                            </div>
                            <div className="rec-details">
                                <h3>{rec.name}, <span className="rec-age">{rec.age}</span></h3>
                                <p className="rec-bio">"{rec.bio}"</p>
                                <div className="rec-tags">
                                    <span className="tag">📍 {getCityName(rec.locationId)}</span>
                                    <span className="tag">🎯 {rec.lookingFor}</span>
                                    <span className="tag">🎵 {rec.musicGenre}</span>
                                    <span className="tag">⚡ {rec.activityLevel}</span>
                                </div>
                                <div className="rec-actions">
                                    <button className="btn-dismiss" onClick={() => handleDismiss(rec.id)}>Dismiss</button>
                                    <button className="btn-connect" onClick={() => handleConnect(rec.id)}>Connect</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}