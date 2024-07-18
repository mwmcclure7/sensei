import { useState } from "react";
import api from "../api";

function RequestPasswordReset() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: any) => {
        setLoading(true);
        e.preventDefault();

        try {
            await api.post("/api/request-password-reset/", { email });
            setMessage(
                `An email has been sent to ${email} to reset your password.`
            );
        } catch (error: any) {
            if (error.response && error.response.status === 400) {
                setMessage("An account with this email does not exist.");
            } else {
                alert(error);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="auth-container">
            <h1>Reset Password</h1>
            <input
                className="auth-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
            />
            <p />
            <button className="auth-button" type="submit" disabled={!email}>
                Submit
            </button>
            {message && (
                <div>
                    <p>{message}</p>
                    <a href="/login">Sign in</a>
                </div>
            )}
        </form>
    );
}

export default RequestPasswordReset;
