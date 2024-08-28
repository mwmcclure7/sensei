import { useState } from "react";
import api from "../api";

function ResetPassword() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: any) => {
        setLoading(true);
        e.preventDefault();
        setMessage("");

        try {
            if (password !== confirmPassword) {
                setMessage("Passwords do not match.");
            } else if (password.length < 8) {
                setMessage("Password must be at least 8 characters long.");
            } else {
                const currentUrl = window.location.pathname;
                const parts = currentUrl.split("/");
                const uidb64 = parts[parts.length - 2];
                const token = parts[parts.length - 1];

                await api.post(`/api/reset-password/${uidb64}/${token}/`, { password });
                setMessage(
                    "Your password has been reset."
                );
            }
        } catch (error: any) {
            alert(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="auth-container">
            <h1>Reset Password</h1>
            <input
                className="auth-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password"
            />
            <input
                className="auth-input"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
            />
            <p />
            <button className={loading ? 'loading' : 'auth-button'} type="submit" disabled={!password || !confirmPassword}>
                Submit
            </button>
            {message && <p>{message}</p>}
            {message === "Your password has been reset." && <a href="/login">Sign in</a>}
        </form>
    );
}

export default ResetPassword;
