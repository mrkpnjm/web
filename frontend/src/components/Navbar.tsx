import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useWS } from "../context/WebSocketContext";
import "./Navbar.css";

export const Navbar = () => {
    const { logout } = useAuth();
    const { subscribe } = useWS();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
    const [unread, setUnread] = useState(0);

    const toggleMenu = (): void => {
        setIsMenuOpen(!isMenuOpen);
    };

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
            <div className="navbar-container">
                <Link to="/" className="navbar-logo" onClick={() => setIsMenuOpen(false)}>
                    match-me
                </Link>

                <button className="menu-toggle" onClick={toggleMenu} aria-label="Toggle Navigation">
                    <span className={`bar ${isMenuOpen ? "open" : ""}`}></span>
                    <span className={`bar ${isMenuOpen ? "open" : ""}`}></span>
                    <span className={`bar ${isMenuOpen ? "open" : ""}`}></span>
                </button>

                <div className={`navbar-links ${isMenuOpen ? "active" : ""}`}>
                    <Link to="/" className="nav-chat-link" onClick={() => setIsMenuOpen(false)}>
                        Chats
                        {unread > 0 && <span className="nav-badge">{unread}</span>}
                    </Link>
                    <button className="logout-btn" onClick={logout}>Logout</button>
                </div>
            </div>
        </nav>
    );
};
