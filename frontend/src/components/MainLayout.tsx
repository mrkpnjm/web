import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import "./MainLayout.css";

export const MainLayout = () => {
    return (
        <div className="app-layout">
            <Navbar />
            <main className="main-content">
                <div className="content-container">
                    <Outlet />
                </div>
            </main>
            <footer className="app-footer">
                <p>&copy; {new Date().getFullYear()} match-me. All rights reserved.</p>
            </footer>
        </div>
    );
};
