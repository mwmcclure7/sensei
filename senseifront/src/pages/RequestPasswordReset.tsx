import { useState } from "react";
import api from "../api";
import toast from "react-hot-toast";

function RequestPasswordReset() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: any) => {
        setLoading(true);
        e.preventDefault();

        try {
            await api.post("/api/request-password-reset/", { email });
            toast.success(
                `An email has been sent to ${email} to reset your password.`
            );
        } catch (error: any) {
            if (error.response && error.response.status === 400) {
                toast.error("An account with this email does not exist.");
            } else {
                console.log(error);
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
            <button
                className={loading ? "loading" : "auth-button"}
                type="submit"
                disabled={!email}
            >
                Submit
            </button>
        </form>
    );
}

export default RequestPasswordReset;
