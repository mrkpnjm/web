import { useState } from "react"; // Import the useState hook from React to manage the open/closed state of the mobile slide-out menu
import { Link } from "react-router-dom"; // Import Link and useNavigate from react-router-dom for navigation between pages
import { useAuth } from "../hooks/useAuth"; // Import the custom useAuth hook to manage authentication state and actions
import './Navbar.css';


// Navbar component that provides navigation links and a logout button
export const Navbar = () => {
    const { logout } = useAuth(); // Get the logout function from the useAuth hook to handle user logout
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false); // State to track whether the mobile slide-out menu is open or closed

    // Function to toggle the open/closed state of the mobile slide-out menu when the menu button is clicked
    const toggleMenu = (): void => {
        setIsMenuOpen(!isMenuOpen);
    };

    // Render the navigation bar with links and a logout button, including a responsive menu for mobile devices
    return (
        <nav className="navbar"> // Main navigation bar container
            <div className="navbar-container"> // Container for the logo, menu toggle button, and navigation links
                <Link to="/" className="navbar-logo" onClick={() => setIsMenuOpen(false)}> // Link to the home page with the logo text "match-me"
                    match-me
                </Link>

                <button className="menu-toggle" onClick={toggleMenu} aria-label="Toggle Navigation"> // Button to toggle the mobile slide-out menu, with an accessible label for screen readers
                    // Span elements representing the bars of the hamburger menu icon, with a class that changes based on whether the menu is open or closed.
                    // uses standard template strings to check the state and inject an 'open' class for CSS manipulation.
                    <span className={`bar ${isMenuOpen ? 'open' : ''}`}></span>

                    // Second bar of the hamburger menu icon. checks state to cleanly transition its CSS opacity to 0 when menu toggles open
                    <span className={`bar ${isMenuOpen ? 'open' : ''}`}></span>

                    // Third bar of the hamburger menu icon. Checks state to trigger cross-intersection animations that shape an 'X' icon
                    <span className={`bar ${isMenuOpen ? 'open' : ''}`}></span>
                </button>

                // Container for the navigation links, which will have an 'active' class added when the mobile menu is open to trigger CSS styles for visibility and layout
                <div className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
                    <Link to="/" onClick={() => setIsMenuOpen(false)}>Chats</Link> // Link to the chat page, which also closes the mobile menu when clicked

                    // Button to trigger the logout function, which clears authentication tokens and navigates to the login page
                    <button className="logout-btn" onClick={logout}>
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};