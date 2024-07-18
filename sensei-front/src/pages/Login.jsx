import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/Form.css";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();

        try {
            const res = await api.post("/api/token/", { email, password });
            localStorage.setItem(ACCESS_TOKEN, res.data.access);
            localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
            window.dispatchEvent(new CustomEvent("login"));
            navigate("/chat");
        } catch (error) {
            if (error.response && error.response.status === 401) {
                setErrorMessage("Invalid email or password.");
            } else {
                alert(error);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="auth-container">
            <h1>Sign In</h1>
            <input
                className="auth-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
            />
            <input
                className="auth-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
            />
            <p>{errorMessage}</p>
            <button
                className="auth-button"
                type="submit"
                disabled={!email || !password}
            >
                Sign In
            </button>
            <a href="/request-password-reset">Forgot password</a>
            <p>
                Don't have an account? <a href="/register">Sign up here</a>!
            </p>
        </form>
    );
}

export default Login;
