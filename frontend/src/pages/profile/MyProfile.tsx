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
                // Fetch profile (about me), bio (stats), and the master location list
                const [profileData, bioData, locs] = await Promise.all([
                    api.getMyProfile().catch(() => null),
                    api.getMyBio().catch(() => null),
                    api.getLocations()
                ]);
                
                setLocations(locs);
                
                if (profileData || bioData) {
                    const loadedProfile: ProfileData = {
                        displayName: profileData?.display_name || "",
                        // Mapped from the new exact rubric split
                        bio: profileData?.about_me || "",
                        avatarUrl: profileData?.avatar_url || "",
                        age: bioData?.age ? bioData.age.toString() : "",
                        gender: bioData?.gender || "male",
                        musicGenre: bioData?.music_genre || "rock",
                        lookingFor: bioData?.looking_for || "friendship",
                        activityLevel: bioData?.activity_level || "moderate",
                        locationId: bioData?.location_id ? bioData.location_id.toString() : "1"
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

    const capitalize = (str: string):string => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

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
                display_name: formData.displayName,
                bio: formData.bio,
                avatar_url: formData.avatarUrl,
                age: formData.age ? parseInt(formData.age) : null,
                gender: formData.gender,
                music_genre: formData.musicGenre,
                looking_for: formData.lookingFor,
                activity_level: formData.activityLevel,
                location_id: formData.locationId ? parseInt(formData.locationId) : null
            });
            setProfile({ ...formData });
            setIsEditing(false);
        } catch (err: unknown) {
            if (err instanceof Error) { setMessage({ text: err.message, type: 'error'})}
            else { setMessage({ text: "Failed to update profile. Check your connection.", type: "error" })};
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div className="container py-4 text-muted">Loading profile...</div>;

    return (
        <div className="container py-4">
            <div className="card p-4 mx-auto" style={{ maxWidth: '640px' }}>
                
                {!isEditing ? (
                    <div className="d-flex flex-column gap-4">
                        <div className="d-flex align-items-center gap-4 pb-4 border-bottom">
                            <div
                                className="rounded-circle bg-body-secondary border d-flex align-items-center justify-content-center flex-shrink-0 fw-bold text-muted"
                                style={{ width: 100, height: 100, fontSize: '2rem' }}
                            >
                                {profile?.avatarUrl ? (
                                    <img className="rounded-circle" style={{ width: '100%', height: '100%', objectFit: 'cover' }} src={profile.avatarUrl} alt="Avatar" />
                                ) : (
                                    <span>?</span>
                                )}
                            </div>
                            <div className="flex-grow-1">
                                <h4 className="mb-1">{profile?.displayName || "Profile Incomplete"}</h4>
                                <p className="text-muted small mb-0">
                                    {profile ? `${profile.age} years old • ${getCityName(profile.locationId)}` : "Complete your profile to be discovered!"}
                                </p>
                            </div>
                            <button className="btn btn-outline-secondary ms-auto" onClick={handleEditClick}>
                                <i className="bi bi-gear me-2"></i> {profile ? "Edit Profile" : "Set up Profile"}
                            </button>
                        </div>

                        {profile && (
                            <div className="d-flex flex-column gap-3">
                                <div>
                                    <p className="text-muted small text-uppercase mb-2" style={{ letterSpacing: '0.5px' }}>About Me</p>
                                    <p className="p-3 rounded bg-body-secondary border text-muted">{profile.bio || "No bio added yet."}</p>
                                </div>

                                <div className="row g-3">
                                    <div className="col-6">
                                        <div className="p-3 rounded bg-body-secondary border h-100">
                                            <span className="text-muted d-block mb-1" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Gender</span>
                                            <span className="fw-semibold">{capitalize(profile.gender)}</span>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="p-3 rounded bg-body-secondary border h-100">
                                            <span className="text-muted d-block mb-1" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Looking For</span>
                                            <span className="fw-semibold">{capitalize(profile.lookingFor)}</span>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="p-3 rounded bg-body-secondary border h-100">
                                            <span className="text-muted d-block mb-1" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Music</span>
                                            <span className="fw-semibold"><i className="bi bi-music-note-beamed me-1"></i> {capitalize(profile.musicGenre)}</span>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="p-3 rounded bg-body-secondary border h-100">
                                            <span className="text-muted d-block mb-1" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Activity</span>
                                            <span className="fw-semibold"><i className="bi bi-lightning-charge me-1"></i> {capitalize(profile.activityLevel)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="d-flex flex-column gap-3">
                        <div className="d-flex justify-content-between align-items-center">
                            <h4 className="mb-0">Profile Settings</h4>
                            <button className="btn btn-outline-secondary" onClick={handleCancelClick} disabled={isSaving}>Cancel</button>
                        </div>

                        {message.text && <div className={`alert ${message.type === 'error' ? 'alert-danger' : 'alert-success'}`}>{message.text}</div>}
                        
                        <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                            <div className="mb-0">
                                <label className="form-label text-muted mb-1">Display Name</label>
                                <input className="form-control" name="displayName" value={formData.displayName} onChange={handleChange} required />
                            </div>

                            <div className="mb-0">
                                <label className="form-label text-muted mb-1">Age</label>
                                <input className="form-control" type="number" name="age" value={formData.age} onChange={handleChange} min="18" max="120" required />
                            </div>

                            <div className="mb-0">
                                <label className="form-label text-muted mb-1">Bio</label>
                                <textarea className="form-control" name="bio" value={formData.bio} onChange={handleChange} rows={4} />
                            </div>

                            <div className="mb-0">
                                <label className="form-label text-muted mb-1">Avatar URL</label>
                                <div className="d-flex gap-2">
                                    <input className="form-control" name="avatarUrl" value={formData.avatarUrl} onChange={handleChange} placeholder="https://example.com/pic.jpg" />
                                    {formData.avatarUrl && (
                                        <button type="button" className="btn btn-outline-danger" onClick={() => setFormData(prev => ({ ...prev, avatarUrl: "" }))}>
                                            Remove
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="row g-3">
                                <div className="col-md-6 d-flex flex-column">
                                    <label>Gender</label>
                                    <select className="form-select" name="gender" value={formData.gender} onChange={handleChange}>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="non-binary">Non-Binary</option>
                                    </select>
                                </div>
                                <div className="col-md-6 d-flex flex-column">
                                    <label>Music</label>
                                    <select className="form-select" name="musicGenre" value={formData.musicGenre} onChange={handleChange}>
                                        <option value="rock">Rock</option>
                                        <option value="pop">Pop</option>
                                        <option value="jazz">Jazz</option>
                                        <option value="electronic">Electronic</option>
                                        <option value="hip-hop">Hip-Hop</option>
                                    </select>
                                </div>
                            </div>

                            <div className="row g-3">
                                <div className="col-md-6 d-flex flex-column">
                                    <label>Looking For</label>
                                    <select className="form-select" name="lookingFor" value={formData.lookingFor} onChange={handleChange}>
                                        <option value="friendship">Friendship</option>
                                        <option value="romance">Romance</option>
                                        <option value="adventure">Adventure</option>
                                    </select>
                                </div>
                                <div className="col-md-6 d-flex flex-column">
                                    <label>Activity Level</label>
                                    <select className="form-select" name="activityLevel" value={formData.activityLevel} onChange={handleChange}>
                                        <option value="low">Low</option>
                                        <option value="moderate">Moderate</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            </div>

                            <label className="form-label text-muted mb-1">City</label>
                            <div className="d-flex flex-column">
                                <select className="form-select" name="locationId" value={formData.locationId} onChange={handleChange}>
                                    {locations.map(loc => (
                                        <option key={loc.id} value={loc.id}>
                                            {loc.city} ({loc.country})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button type="submit" className="btn btn-primary w-100 mt-2" disabled={isSaving}>
                                {isSaving ? "Saving..." : "Save Changes"}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}