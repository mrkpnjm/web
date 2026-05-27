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

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.log("Failed to log out", error);
    } finally {
      window.location.href = "/login";
    }
  };

  // Close the hamburger menu automatically when navigating to a new page
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Reset unread count when visiting the chat list
  useEffect(() => {
    if (location.pathname === "/") setUnread(0);
  }, [location.pathname]);

  useEffect(() => {
    if (!subscribe) return;
    return subscribe((msg: unknown) => {
      const m = msg as { type: string };
      if (m.type === "message" && location.pathname !== "/") {
        setUnread((prev) => prev + 1);
      }
    });
  }, [subscribe, location.pathname]);

  return (
    <nav className="navbar">
      <div className="navbar-container">

        {/* Left side: Hamburger Icon & Logo */}
        <div className="navbar-left">
            <button
                className="menu-toggle"
                onClick={toggleMenu}
                aria-label="Toggle Navigation"
            >
                <span className={`bar ${isMenuOpen ? "open" : ""}`}></span>
                <span className={`bar ${isMenuOpen ? "open" : ""}`}></span>
                <span className={`bar ${isMenuOpen ? "open" : ""}`}></span>
            </button>
            <Link
            to="/"
            className="navbar-logo"
            onClick={() => setIsMenuOpen(false)}
            >
            match-me
            </Link>
        </div>
        
        {/* Right side: Persistent Logout Button */}
        <button className="logout-btn" onClick={handleLogout}>
            Logout
        </button>

        {/* Slide-out Menu (Hidden by default) */}
        <div className={`navbar-links ${isMenuOpen ? "active" : ""}`}>
          <Link to="/recommendations" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              Discover
          </Link>
          <Link to="/" className="nav-chat-link" onClick={() => setIsMenuOpen(false)}>
            Chats
            {unread > 0 && <span className="nav-badge">{unread}</span>}
          </Link>
          <Link to="/profile" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              Profile
          </Link>
          {/* Add future routes here (e.g., Profile, Settings) */}
          
        </div>
      </div>
    </nav>
  );
};
