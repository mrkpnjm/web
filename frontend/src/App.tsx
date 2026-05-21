import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ChatList from "./pages/chat/ChatList";
import ChatView from "./pages/chat/ChatView";

function PrivateRoute({ children }: { children: React.ReactNode }) {
    const { isLoggedIn } = useAuth();
    return isLoggedIn ? <>{children}</> : <Navigate to="/login" />;
}

export default function App() {
    const { isLoggedIn, logout } = useAuth();

    return (
        <BrowserRouter>
            {isLoggedIn && (
                <nav className="navbar">
                    <span className="nav-brand">match-me</span>
                    <button onClick={logout}>Log out</button>
                </nav>
            )}
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<PrivateRoute><ChatList /></PrivateRoute>} />
                <Route path="/chat/:userId" element={<PrivateRoute><ChatView /></PrivateRoute>} />
            </Routes>
        </BrowserRouter>
    );
}
