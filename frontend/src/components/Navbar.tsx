import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useWS } from "../context/WebSocketContext";

export const Navbar = () => {
  const { logout } = useAuth();
  const { subscribe } = useWS();
  const location = useLocation();
  const navigate = useNavigate(); // Initialize navigate
  const [unread, setUnread] = useState(0);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.log("Failed to log out", error);
    } finally {
      navigate("/login");
    }
  };

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
    <nav
      className="navbar fixed-top px-4"
      style={{backgroundColor: 'var(--bs-navbar-bg)', borderBottom: '1px solid var(--bs-border-color)', height: '60px'}}
    >
      <div className="d-flex w-100 align-items-center">

        {/* Left side: Logo */}
        <Link
          to="/"
          className="navbar-brand fw-bold me-4"
          style={{ color: '#a78bfa'}}
        >match-me</Link>

        {/* Center: Links to pages */}
        <div className="d-flex gap-1 flex-grow-1">
          <Link
            to="/recommendations"
            className={`px-3 ${location.pathname === '/recommendations' ? 'active-link' : ''}`}
          >Discover</Link>
          <Link
            to="/"
            className={`px-3 position-relative ${location.pathname === '/' ? 'active-link' : ''}`}
          >
            Chats
            {unread > 0 && <span className="badge bg-danger rounded-pill position-absolute top-0 start-100 translate-middle">{unread}</span>}
          </Link>
          <Link
            to="/connections"
            className={`px-3 ${location.pathname === '/connections' ? 'active-link' : ''}`}
          >Connections</Link>
          <Link
            to="/profile"
            className={`px-3 ${location.pathname === '/profile' ? 'active-link' : ''}`}
          >Profile</Link>
        </div>
        
        {/* Right side: Persistent Logout Button */}
        <button className="btn btn-link text-body-secondary text-decoration-none p-0" onClick={handleLogout}>
            Logout
        </button>
      </div>
    </nav>
  );
};
