import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";

export const MainLayout = () => {
    const location = useLocation();
    const isChatView = location.pathname.startsWith("/chat/");
    return (
        <div className="bg-body min-vh-100 d-flex flex-column">
            <Navbar />
            <main
                className={`flex-grow-1 ${isChatView ? "overflow-hidden d-flex flex-column" : "mt-5 pt-2"}`}
                style={isChatView ? { marginTop: '60px' } : {}}>
                <div className={isChatView ? "flex-grow-1 d-flex flex-column" : "w-100"}>
                    <Outlet />
                </div>
            </main>
            {!isChatView && (
                <footer className="text-center py-3 border-top text-muted">
                    <p>&copy; {new Date().getFullYear()} match-me. All rights reserved.</p>
                </footer>
            )}
        </div>
    );
};
