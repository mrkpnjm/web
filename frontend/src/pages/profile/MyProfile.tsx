import { useEffect, useState } from "react";
import { api } from "../../api";

interface ProfileData {
    displayName: string;
    bio: string;
    avatarUrl: string;
    age: string;
    gender: string;
    musicGenre: string;
    lookingFor: string;
    activityLevel: string;
    locationId: string;
}

interface Location {
    id: number;
    city: string;
    country: string;
}

const defaultProfile: ProfileData = {
    displayName: "",
    bio: "",
    avatarUrl: "",
    age: "",
    gender: "male",
    musicGenre: "rock",
    lookingFor: "friendship",
    activityLevel: "moderate",
    locationId: "1"
};

export default function MyProfile() {
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [formData, setFormData] = useState<ProfileData>(defaultProfile);
    const [locations, setLocations] = useState<Location[]>([]); // Dynamic list
    
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            try {
                // Fetch both profile and the master location list
                const [profileData, locs] = await Promise.all([
                    api.getMyProfile().catch(() => null),
                    api.getLocations()
                ]);
                
                setLocations(locs);
                
                if (profileData) {
                    const loadedProfile: ProfileData = {
                        displayName: profileData.displayName || "",
                        bio: profileData.bio || "",
                        avatarUrl: profileData.avatarUrl || "",
                        age: profileData.age ? profileData.age.toString() : "",
                        gender: profileData.gender || "male",
                        musicGenre: profileData.musicGenre || "rock",
                        lookingFor: profileData.lookingFor || "friendship",
                        activityLevel: profileData.activityLevel || "moderate",
                        locationId: profileData.locationId ? profileData.locationId.toString() : "1"
                    };
                    setProfile(loadedProfile);
                    setFormData(loadedProfile);
                }
            } catch (err) {
                console.error("Failed to load profile data", err);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    const getCityName = (id: string) => {
        const loc = locations.find(l => l.id.toString() === id);
        return loc ? `${loc.city} (${loc.country})` : "Location not set";
    };

    const handleEditClick = () => {
        setFormData(profile || defaultProfile);
        setMessage({ text: "", type: "" });
        setIsEditing(true);
    };

    const handleCancelClick = () => setIsEditing(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ text: "", type: "" });
        setIsSaving(true);
        
        try {
            await api.updateMyProfile({
                ...formData,
                age: formData.age ? parseInt(formData.age) : null,
                locationId: formData.locationId ? parseInt(formData.locationId) : null
            });
            setProfile({ ...formData });
            setIsEditing(false);
        } catch (err) {
            setMessage({ text: "Failed to update profile. Check your connection.", type: "error" });
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div className="page">Loading profile...</div>;

    return (
        <div className="page profile-page">
            <div className="profile-card">
                
                {!isEditing ? (
                    <div className="profile-overview">
                        <div className="profile-header">
                            <div className="profile-avatar-large">
                                {profile?.avatarUrl ? (
                                    <img src={profile.avatarUrl} alt="Avatar" />
                                ) : (
                                    <div className="avatar-placeholder">?</div>
                                )}
                            </div>
                            <div className="profile-title">
                                <h2>{profile?.displayName || "Profile Incomplete"}</h2>
                                <p className="profile-subtitle">
                                    {profile ? `${profile.age} years old • ${getCityName(profile.locationId)}` : "Complete your profile to be discovered!"}
                                </p>
                            </div>
                            <button className="btn-secondary edit-btn" onClick={handleEditClick}>
                                ⚙️ {profile ? "Edit Profile" : "Set up Profile"}
                            </button>
                        </div>

                        {profile && (
                            <div className="profile-body">
                                <div className="info-group">
                                    <h3>About Me</h3>
                                    <p className="bio-text">{profile.bio || "No bio added yet."}</p>
                                </div>

                                <div className="info-grid">
                                    <div className="info-item">
                                        <span className="info-label">Gender</span>
                                        <span className="info-value">{profile.gender}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Looking For</span>
                                        <span className="info-value">{profile.lookingFor}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Music</span>
                                        <span className="info-value">🎵 {profile.musicGenre}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Activity</span>
                                        <span className="info-value">⚡ {profile.activityLevel}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="profile-edit-mode">
                        <div className="edit-header">
                            <h2>Profile Settings</h2>
                            <button className="btn-secondary" onClick={handleCancelClick} disabled={isSaving}>Cancel</button>
                        </div>

                        {message.text && <div className={`form-message ${message.type}`}>{message.text}</div>}
                        
                        <form onSubmit={handleSubmit} className="profile-form">
                            <label>Display Name</label>
                            <input name="displayName" value={formData.displayName} onChange={handleChange} required />

                            <label>Age</label>
                            <input type="number" name="age" value={formData.age} onChange={handleChange} min="18" max="120" required />

                            <label>Bio</label>
                            <textarea name="bio" value={formData.bio} onChange={handleChange} rows={4} />

                            <label>Avatar URL</label>
                            <input name="avatarUrl" value={formData.avatarUrl} onChange={handleChange} placeholder="https://example.com/pic.jpg" />

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Gender</label>
                                    <select name="gender" value={formData.gender} onChange={handleChange}>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="non-binary">Non-Binary</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Music</label>
                                    <select name="musicGenre" value={formData.musicGenre} onChange={handleChange}>
                                        <option value="rock">Rock</option>
                                        <option value="pop">Pop</option>
                                        <option value="jazz">Jazz</option>
                                        <option value="electronic">Electronic</option>
                                        <option value="hip-hop">Hip-Hop</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Looking For</label>
                                    <select name="lookingFor" value={formData.lookingFor} onChange={handleChange}>
                                        <option value="friendship">Friendship</option>
                                        <option value="romance">Romance</option>
                                        <option value="adventure">Adventure</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Activity Level</label>
                                    <select name="activityLevel" value={formData.activityLevel} onChange={handleChange}>
                                        <option value="low">Low</option>
                                        <option value="moderate">Moderate</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            </div>

                            <label>City</label>
                            <select name="locationId" value={formData.locationId} onChange={handleChange}>
                                {locations.map(loc => (
                                    <option key={loc.id} value={loc.id}>
                                        {loc.city} ({loc.country})
                                    </option>
                                ))}
                            </select>

                            <button type="submit" className="btn-primary" disabled={isSaving}>
                                {isSaving ? "Saving..." : "Save Changes"}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}