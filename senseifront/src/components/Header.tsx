import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Header.css";
import logo from "../assets/sensei-logo-t.svg";
import { ACCESS_TOKEN } from "../constants";

const Header = () => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(
        localStorage.getItem(ACCESS_TOKEN) !== null
    );

    useEffect(() => {
        setIsAuthenticated(localStorage.getItem(ACCESS_TOKEN) !== null);

        const handleLogin = () => {
            setIsAuthenticated(true);
        };

        const handleLogout = () => {
            setIsAuthenticated(false);
        };

        window.addEventListener("login", handleLogin);
        window.addEventListener("logout", handleLogout);

        return () => {
            window.removeEventListener("login", handleLogin);
            window.removeEventListener("logout", handleLogout);
        };
    }, []);

    return (
        <header className="header">
            <Link to="/">
                <img
                    src={logo}
                    alt="logo"
                    className="logo"
                />
            </Link>
            <nav>
                <Link to="/">Home</Link>
                <Link to="/chat">Sensei</Link>
                <Link to="/contact">Contact</Link>
            </nav>
            {isAuthenticated ? (
                <button
                    onClick={() => navigate("/settings")}
                    className="profile-picture"
                />
            ) : (
                <button
                    onClick={() => navigate("/login")}
                    className="sign-in-button"
                >
                    Sign In
                </button>
            )}
        </header>
    );
};

export default Header;
