import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useWS } from "../context/WebSocketContext";

export const Navbar = () => {
  const { logout } = useAuth();
  const { subscribe } = useWS();
  const location = useLocation();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  // Close mobile menu on navigation
  useEffect(() => setMenuOpen(false), [location.pathname]);

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

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to log out", error);
    } finally {
      navigate("/login");
    }
  };

  const linkClass = (path: string) =>
    `px-3 ${location.pathname === path ? "active-link" : ""}`;

  return (
    <>
      <nav
        className="navbar fixed-top px-3 px-md-4"
        style={{
          backgroundColor: "var(--bs-navbar-bg)",
          borderBottom: "1px solid var(--bs-border-color)",
          height: "60px",
          zIndex: 1030,
        }}
      >
        <div className="d-flex w-100 align-items-center" style={{ height: "60px" }}>
          {/* Logo */}
          <Link to="/" className="navbar-brand fw-bold me-4" style={{ color: "#a78bfa" }}>
            match-me
          </Link>

          {/* Desktop links */}
          <div className="d-none d-md-flex gap-1 flex-grow-1">
            <Link to="/recommendations" className={linkClass("/recommendations")}>Discover</Link>
            <Link to="/" className={`${linkClass("/")} position-relative`}>
              Chats
              {unread > 0 && (
                <span className="badge bg-danger rounded-pill position-absolute top-0 start-100 translate-middle">
                  {unread}
                </span>
              )}
            </Link>
            <Link to="/connections" className={linkClass("/connections")}>Connections</Link>
            <Link to="/profile" className={linkClass("/profile")}>Profile</Link>
          </div>

          {/* Desktop logout */}
          <button
            className="d-none d-md-block btn btn-link text-body-secondary text-decoration-none p-0"
            onClick={handleLogout}
          >
            Logout
          </button>

          {/* Mobile hamburger */}
          <button
            className="d-md-none btn btn-link text-body-secondary p-0 ms-auto position-relative"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle navigation"
          >
            {unread > 0 && !menuOpen && (
              <span
                className="badge bg-danger rounded-pill position-absolute"
                style={{ top: -4, right: -4, fontSize: "0.6rem", minWidth: "1rem" }}
              >
                {unread}
              </span>
            )}
            <i className={`bi ${menuOpen ? "bi-x-lg" : "bi-list"} fs-4`}></i>
          </button>
        </div>
      </nav>

      {/* Mobile dropdown — sits below the 60 px bar, overlays content */}
      {menuOpen && (
        <div
          className="d-md-none position-fixed w-100"
          style={{
            top: "60px",
            left: 0,
            backgroundColor: "var(--bs-navbar-bg)",
            borderBottom: "1px solid var(--bs-border-color)",
            zIndex: 1029,
          }}
        >
          <div className="d-flex flex-column p-3 gap-1">
            <Link to="/recommendations" className={`py-2 px-3 rounded ${linkClass("/recommendations")}`}>
              Discover
            </Link>
            <Link to="/" className={`py-2 px-3 rounded position-relative ${linkClass("/")}`}>
              Chats
              {unread > 0 && (
                <span className="badge bg-danger rounded-pill ms-2">{unread}</span>
              )}
            </Link>
            <Link to="/connections" className={`py-2 px-3 rounded ${linkClass("/connections")}`}>
              Connections
            </Link>
            <Link to="/profile" className={`py-2 px-3 rounded ${linkClass("/profile")}`}>
              Profile
            </Link>
            <hr className="my-1" />
            <button
              className="btn btn-link text-body-secondary text-decoration-none text-start px-3 py-2"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </>
  );
};