import React, { useState, useEffect } from "react";
import "../styles/Header.css";
import logo from "../assets/sensei-logo-t.svg";
import { ACCESS_TOKEN } from "../constants";

const Header = () => {
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
            <div className="left">
                <img src={logo} alt="logo" className="logo" />
                <p>SoftwareSensei.ai</p>
            </div>
            <nav className="middle">
                <a href="/">Home</a>
                <a href="sensei">Sensei</a>
                <a href="tokens">Tokens</a>
            </nav>
            <div className="right">
                {isAuthenticated ? (
                    <button
                        onClick={() => (window.location.href = "/settings")}
                        className="profile-picture"
                    />
                ) : (
                    <button
                        onClick={() => (window.location.href = "/login")}
                        className="sign-in-button"
                    >
                        Sign In
                    </button>
                )}
            </div>
        </header>
    );
};

export default Header;