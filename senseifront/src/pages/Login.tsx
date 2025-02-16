import { useState } from "react";
import toast from "react-hot-toast";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import { Link } from "react-router-dom";
import "../styles/Form.css";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: any) => {
        setLoading(true);
        e.preventDefault();

        try {
            const res = await api.post("/api/token/", { email, password });
            localStorage.setItem(ACCESS_TOKEN, res.data.access);
            localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
            window.dispatchEvent(new CustomEvent("login"));
            navigate("/chat");
        } catch (error: any) {
            if (error.response && error.response.status === 401) {
                toast.error("Invalid email or password.");
            } else {
                console.log(error);
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
            <button
                className={loading ? "loading" : "auth-button"}
                type="submit"
                disabled={!email || !password}
            >
                Sign In
            </button>
            <Link to="/request-password-reset">Forgot password</Link>
            <p>
                Don't have an account? <Link to="/register">Sign up here</Link>!
            </p>
        </form>
    );
}

export default Login;
