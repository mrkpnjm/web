import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";

export const MainLayout = () => {
    return (
        <div className="bg-body min-vh-100 d-flex flex-column">
            <Navbar />
            <main className="mt-5 pt-3 flex-grow-1">
                <div className="w-100">
                    <Outlet />
                </div>
            </main>
            <footer className="text-center py-3 border-top text-muted">
                <p>&copy; {new Date().getFullYear()} match-me. All rights reserved.</p>
            </footer>
        </div>
    );
};
