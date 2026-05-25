import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import './MainLayout.css';

export const MainLayout = () => {
    return (
        <div className="app-layout"> // Main container for the layout, which includes the Navbar and the Outlet for rendering child routes
            <Navbar /> // Render the Navbar component at the top of the layout
            <main className="main-content"> // Container for the main content area where child routes will be rendered
                <div className="content-container"> // Wrapper for the content to provide padding and layout styling
                    <Outlet /> // Render the child route components here, allowing for nested routing within the main layout
                </div>
            </main>

            <footer className="app-footer"> // Footer section of the layout, which can include additional information or links
                <p>&copy; {new Date().getFullYear()} DevConnect. All rights reserved.</p>
            </footer>
        </div>
    );
}