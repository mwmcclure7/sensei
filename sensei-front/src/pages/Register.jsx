import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";

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

        try {
            const res = await api.post("/api/register/", { email, password });
            navigate("/login");
        } catch (error) {
            if (error.response && error.response.status === 400) {
                setErrorMessage("An account with this email already exists.");
            } else {
                alert(error);
            }
        } finally {
            setLoading(false);
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
                onChange={(e) => {
                    setPasswordConfirm(e.target.value);
                    if (e.target.value === password) {
                        setErrorMessage("");
                    } else {
                        setErrorMessage("Passwords do not match.");
                    }
                }}
                placeholder="Confirm Password"
            />
            <p>{errorMessage}</p>
            <button
                className="auth-button"
                type="submit"
                disabled={!email || !password || !passwordConfirm || password !== passwordConfirm}
            >
                Create Account
            </button>
        </form>
    );
}

export default Register;
