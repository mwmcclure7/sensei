import { useState } from "react";
import toast from "react-hot-toast";
import api from "../api";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Form.css";

function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [loading, setLoading] = useState(false);
    const [privacyPolicyChecked, setPrivacyPolicyChecked] = useState(false);
    const [termsChecked, setTermsChecked] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e: any) => {
        setLoading(true);
        e.preventDefault();

        try {
            if (password !== passwordConfirm) {
                toast.error("Passwords do not match.");
            } else if (password.length < 8) {
                toast.error("Password must be at least 8 characters.");
            } else {
                await api.post("/api/register/", { email, password });
                navigate("/activated");
            }
        } catch (error: any) {
            if (error.response && error.response.status === 400) {
                toast.error("An account with this email already exists.");
            } else {
                console.log(error);
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
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="Confirm Password"
            />
            <div className="agree">
                <div>
                    <input
                        type="checkbox"
                        checked={privacyPolicyChecked}
                        onChange={(e) =>
                            setPrivacyPolicyChecked(e.target.checked)
                        }
                    />
                    <label>
                        I have read and agree to the{" "}
                        <a
                            href="SENSEI.AI-Privacy-Policy.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Privacy Policy
                        </a>
                    </label>
                </div>
                <div>
                    <input
                        type="checkbox"
                        checked={termsChecked}
                        onChange={(e) => setTermsChecked(e.target.checked)}
                    />
                    <label>
                        I have read and agree to the{" "}
                        <a
                            href="SENSEI.AI-Terms-and-Conditions.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Terms and Conditions
                        </a>
                    </label>
                </div>
            </div>
            <button
                className={loading ? "loading" : "auth-button"}
                type="submit"
                disabled={
                    !email ||
                    !password ||
                    !passwordConfirm ||
                    !privacyPolicyChecked ||
                    !termsChecked
                }
            >
                Create Account
            </button>
            <p>
                Already have an account? <Link to="/login">Sign in here</Link>!
            </p>
        </form>
    );
}

export default Register;
