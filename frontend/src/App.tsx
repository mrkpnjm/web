import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { WebSocketProvider, useWS } from "./context/WebSocketContext";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ChatList from "./pages/chat/ChatList";
import ChatView from "./pages/chat/ChatView";

function PrivateRoute({ children }: { children: React.ReactNode }) {
    const { isLoggedIn } = useAuth();
    return isLoggedIn ? <>{children}</> : <Navigate to="/login" />;
}

function Navbar({ logout }: { logout: () => void }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { subscribe } = useWS();
    const [unread, setUnread] = useState(0);

    useEffect(() => {
        if (location.pathname === "/") setUnread(0);
    }, [location.pathname]);

    useEffect(() => {
        return subscribe((msg: unknown) => {
            const m = msg as { type: string };
            if (m.type === "message" && location.pathname !== "/") {
                setUnread(prev => prev + 1);
            }
        });
    }, [subscribe, location.pathname]);

    return (
        <nav className="navbar">
            <span className="nav-brand">match-me</span>
            <div className="nav-links">
                <button className="nav-link" onClick={() => navigate("/")}>
                    Messages
                    {unread > 0 && <span className="nav-badge">{unread}</span>}
                </button>
            </div>
            <button onClick={logout}>Log out</button>
        </nav>
    );
}

export default function App() {
    const { isLoggedIn, logout } = useAuth();
    const token = localStorage.getItem("token");

    return (
        <BrowserRouter>
            <WebSocketProvider token={isLoggedIn ? token : null}>
                {isLoggedIn && <Navbar logout={logout} />}
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/" element={<PrivateRoute><ChatList /></PrivateRoute>} />
                    <Route path="/chat/:userId" element={<PrivateRoute><ChatView /></PrivateRoute>} />
                </Routes>
            </WebSocketProvider>
        </BrowserRouter>
    );
}
