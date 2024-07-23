import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import "../styles/Form.css";

function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();
        setErrorMessage("");

        try {
            if (password !== passwordConfirm) {
                setErrorMessage("Passwords do not match.");
            } else if (password.length < 8) {
                setErrorMessage("Password must be at least 8 characters.");
            } else {
                await api.post("/api/register/", { email, password });
            }
        } catch (error) {
            if (error.response && error.response.status === 400) {
                setErrorMessage("An account with this email already exists.");
            } else {
                alert(error);
            }
        } finally {
            setLoading(false);
            navigate("/activate-email-sent");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="auth-container">
            <h1>Create an Account</h1>
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
            <input
                className="auth-input"
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="Confirm Password"
            />
            <p>{errorMessage}</p>
            <button
                className={loading ? 'loading' : 'auth-button'}
                type="submit"
                disabled={!email || !password || !passwordConfirm}
            >
                Create Account
            </button>
            <p>Already have an account? <a href="/login">Sign in here</a>!</p>
        </form>
    );
}

export default Register;
