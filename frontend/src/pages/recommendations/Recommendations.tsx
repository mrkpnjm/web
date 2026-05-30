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

    const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

    const loadRecommendations = async () => {
        try {
            const ids: string[] = await api.getRecommendations();
            const details = await Promise.all(
                ids.map(async (id) => {
                    try {
                        //Fetch base user, profile (about me) and bio 
                        const [userBase, userProfile, userBio] = await Promise.all([
                            api.getUser(id),
                            api.getProfile(id),
                            api.getUserBio(id) 
                        ]);
                        return {
                            id: id,
                            name: userBase.name,
                            avatar_url: userProfile.avatar_url || userBase.profile_picture,
                            bio: userProfile.about_me, 
                            age: userBio.age,
                            gender: userBio.gender,
                            musicGenre: userBio.music_genre,
                            activityLevel: userBio.activity_level,
                            locationId: userBio.location_id?.toString() || "0",
                            lookingFor: userBio.looking_for || "Not specified"
                        };
                    } catch (err: unknown) {
                        console.error("Failed to load profile/bio for id", id, err);
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

    if (loading) return <div className="container py-4 text-muted">Loading recommendations...</div>;

    return (
        <div className="container py-4">
            <h2 className="mb-4">Discover Connections</h2>
            {recommendations.length === 0 ? (
                <p className="text-muted">No recommendations available. Complete your profile or change preferences.</p>
            ) : (
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                    {recommendations.map((rec) => (
                        <div key={rec.id} className="col">
                            <div className="card h-100">
                                <div className="card-img-top d-flex align-items-center justify-content-center bg-body-secondary" style={{ height: '200px' }}>
                                    {rec.avatar_url ? (
                                        <img src={rec.avatar_url} alt={rec.name} className="w-100 h-100" style={{ objectFit: 'cover' }} />
                                    ) : (
                                        <div className="display-4 text-muted">{getInitials(rec.name)}</div>
                                    )}
                                </div>
                                <div className="card-body d-flex flex-column">
                                    <h5 className="card-title fw-semibold mb-1">{rec.name}, <span className="fw-normal text-muted">{rec.age}</span></h5>
                                    <p className="card-text text-muted small flex-grow-1 mb-3">"{rec.bio}"</p>
                                    <div className="d-flex flex-wrap gap-1 mb-3">
                                        <span className="badge rounded-pill border text-muted small" style={{ backgroundColor: 'transparent' }}>📍 {getCityName(rec.locationId)}</span>
                                        <span className="badge rounded-pill border text-muted small" style={{ backgroundColor: 'transparent' }}>🎯 {rec.lookingFor}</span>
                                        <span className="badge rounded-pill border text-muted small" style={{ backgroundColor: 'transparent' }}>🎵 {rec.musicGenre}</span>
                                        <span className="badge rounded-pill border text-muted small" style={{ backgroundColor: 'transparent' }}>⚡ {rec.activityLevel}</span>
                                    </div>
                                    <div className="d-flex gap-2 mt-auto">
                                        <button className="btn btn-outline-danger flex-fill" onClick={() => handleDismiss(rec.id)}>Dismiss</button>
                                        <button className="btn btn-outline-success flex-fill" onClick={() => handleConnect(rec.id)}>Connect</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}