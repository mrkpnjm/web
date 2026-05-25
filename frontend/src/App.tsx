import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ChatList from "./pages/chat/ChatList";
import ChatView from "./pages/chat/ChatView";
import { MainLayout } from "./components/MainLayout";

function PrivateRoute({ children }: { children: React.ReactNode }) {
    const { isLoggedIn } = useAuth();
    return isLoggedIn ? <>{children}</> : <Navigate to="/login" />;
}

export default function App() {
    // const { isLoggedIn, logout } = useAuth();

    return (
        <BrowserRouter>
            {/* {isLoggedIn && (
                <nav className="navbar">
                    <span className="nav-brand">match-me</span>
                    <button onClick={logout}>Log out</button>
                </nav>
            )} */}
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Layout Route:
                  Wraps MainLayout inside your PrivateRoute guard.
                  If logged in, MainLayout mounts and renders child routes via <Outlet />.
                */}
                <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
                    <Route path="/" element={<ChatList />} />
                    <Route path="/chat/:userId" element={<ChatView />} />
                </Route>

                {/* <Route path="/" element={<PrivateRoute><ChatList /></PrivateRoute>} />
                <Route path="/chat/:userId" element={<PrivateRoute><ChatView /></PrivateRoute>} /> */}

                {/* Fallback Catch-All Route */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
