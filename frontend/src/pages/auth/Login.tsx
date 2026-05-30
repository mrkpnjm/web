import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    function validate(): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setEmailError("Please enter a valid email address");
            return false;
        }
        setEmailError("");
        return true;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!validate()) return;
        setError("");
        setLoading(true);
        try {
            await login(email, password);
            navigate("/");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Login failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-body">
            <div className="card p-4 p-md-5" style={{ width: '100%', maxWidth: '400px' }}>
                <div className="card-body">
                    <h4 className="mb-4">Welcome back</h4>
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
                        {emailError&& <p className="text-danger small mb-2">{emailError}</p>}
                        <label className="form-label">Password</label>
                        <input
                            className="form-control mb-3"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                        {error && <p className="text-danger small">{error}</p>}
                        <button className="btn btn-primary w-100 mt-2" type="submit" disabled={loading}>
                            {loading ? "Logging in..." : "Log in"}
                        </button>
                    </form>
                    <p className="text-center text-secondary mt-3 small">No account? <Link to="/register">Register</Link></p>
                </div>
            </div>
        </div>
    );
}
