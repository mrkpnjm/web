import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");
    const [password, setPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    function validate(): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setEmailError("Please enter a valid email address");
            return false;
        }
        setEmailError("");
        if (password.length < 8) {
            setPasswordError("Password must be at least 8 characters");
            return false;
        }
        setPasswordError("");
        return true;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!validate()) return;
        setError("");
        setLoading(true);
        try {
            await register(email, password);
            navigate("/");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Registration failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-body">
            <div className="card p-4 p-md-5" style={{ width: '100%', maxWidth: '400px' }}>
                <div className="card-body">
                    <h4 className="mb-4">Create account</h4>
                        <form onSubmit={handleSubmit}>
                            <label className="form-label">Email</label>
                            <input
                                className="form-control mb-1"
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                autoFocus
                            />
                            {emailError && <p className="text-danger small mb-2">{emailError}</p>}
                            <label className="form-label">Password</label>
                            <input
                                className={`form-control mb-1 ${passwordError ? "is-invalid" : ""}`}
                                type="password"
                                value={password}
                                onChange={e => { setPassword(e.target.value); setPasswordError(""); }}
                                required
                            />
                            {passwordError && <p className="text-danger small mb-2">{passwordError}</p>}
                            {error && <p className="text-danger small mb-2">{error}</p>}
                            <button className="btn btn-primary w-100 mt-2" type="submit" disabled={loading}>
                                {loading ? "Creating account..." : "Register"}
                            </button>
                        </form>
                        <p className="text-center text-secondary mt-3 small">Already have an account? <Link to="/login">Log in</Link></p>
                </div>
            </div>
        </div>
    );
}
