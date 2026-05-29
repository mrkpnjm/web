import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { WebSocketProvider } from "./context/WebSocketContext";
import { MainLayout } from "./components/MainLayout";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ChatList from "./pages/chat/ChatList";
import ChatView from "./pages/chat/ChatView";
import Recommendations from "./pages/recommendations/Recommendations";
import MyProfile from "./pages/profile/MyProfile";
import { ConnectionsPage } from "./pages/connections/ConnectionsPage";

function PrivateRoute({ children }: { children: React.ReactNode }) {
    const { isLoggedIn } = useAuth();
    return isLoggedIn ? <>{children}</> : <Navigate to="/login" />;
}

export default function App() {
    const { isLoggedIn, token } = useAuth(); // Now pulling token from global context

    return (
        <BrowserRouter>
            <WebSocketProvider token={isLoggedIn ? token : null}>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    
                    <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
                        <Route path="/" element={<ChatList />} />
                        <Route path="/chat/:userId" element={<ChatView />} />
                        <Route path="/connections" element={<ConnectionsPage />} />
                        <Route path="/recommendations" element={<Recommendations />} />
                        <Route path="/profile" element={<MyProfile />} />
                    </Route>
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </WebSocketProvider>
        </BrowserRouter>
    );
}
