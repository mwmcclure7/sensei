import React, { useState, useEffect } from "react";
import "../App.css";
import "../styles/Settings.css";
import { useNavigate } from "react-router-dom";
import api from "../api";

function Modal({
    onClose,
    children,
}: {
    onClose: () => void;
    children: React.ReactNode;
}) {
    return (
        <div className="modal" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
}

const Settings = () => {
    const [loading, setLoading] = useState(false);
    // Delete account functionality
    const [isModalOpen, setModalOpen] = useState(false);
    const [confirm, setConfirm] = useState("");
    const [deleteErrorMessage, setDeleteErrorMessage] = useState("");

    const navigate = useNavigate();

    const toggleModal = () => setModalOpen(!isModalOpen);

    const handleDeleteSubmit = async (e: any) => {
        e.preventDefault();
        setDeleteErrorMessage("");

        try {
            await api.post("/api/deactivate-account/");
        } catch (error) {
            setDeleteErrorMessage("An error occurred. Please try again.");
        } finally {
            localStorage.clear();
            window.dispatchEvent(new CustomEvent("login"));
            navigate("/");
        }
    };

    // Update account functionality
    const [info, setInfo] = useState("");
    const [profileMessage, setProfileMessage] = useState("");

    const fetchUserData = async () => {
        try {
            const response = await api.get("/api/get-profile/");
            setInfo(response.data.info);
            setEmail(response.data.email);
        } catch (error) {
            alert(error);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    const handleProfileSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        setProfileMessage("");

        try {
            await api.post("/api/update-profile/", {
                info: info,
            });
            setProfileMessage("Profile updated successfully.");
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
        }
    };

    // Change email functionality
    const [email, setEmail] = useState("");
    const [emailMessage, setEmailMessage] = useState("");

    const handleEmailSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        setEmailMessage("");
        try {
            await api.post("/api/update-email-request/", {
                email: email,
            });
        } catch (error) {
            alert(error);
        } finally {
            setEmailMessage(
                "An email has been sent to this address for confirmation."
            );
            setLoading(false);
        }
    };

    // Change password functionality
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordMessage, setPasswordMessage] = useState("");

    const handlePasswordSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        setPasswordMessage("");
        try {
            if (password !== confirmPassword) {
                setPasswordMessage("Passwords do not match.");
            } else if (password.length < 8) {
                setPasswordMessage(
                    "Password must be at least 8 characters long."
                );
            } else {
                await api.post("/api/update-password/", {
                    password: password,
                });
                setPassword("");
                setConfirmPassword("");
                setPasswordMessage("Your password has been updated.");
            }
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="settings">
            <form className="profile-settings" onSubmit={handleProfileSubmit}>
                <h1>Profile</h1>
                <div className="info-div">
                    <label htmlFor="info" className="info-label">
                        Enter any information you would like Sensei to know
                        about you for further personalization, such as skills or
                        prior experience.
                    </label>
                    <textarea
                        id="info"
                        value={info}
                        onChange={(e) => setInfo(e.target.value)}
                        maxLength={500}
                    />
                </div>
                <button
                    type="submit"
                    className={loading ? "loading" : "update-profile-submit"}
                >
                    Update Profile
                </button>
                {profileMessage && <p>{profileMessage}</p>}
            </form>

            <div className="account-update">
                <form onSubmit={handleEmailSubmit}>
                    <h1>Email</h1>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <button
                        type="submit"
                        className={loading ? "loading" : "update-email-submit"}
                    >
                        Update Email
                    </button>
                    {emailMessage && <p>{emailMessage}</p>}
                </form>
                <form onSubmit={handlePasswordSubmit}>
                    <h1>Password</h1>
                    <input
                        type="password"
                        id="password"
                        placeholder="New Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <input
                        type="password"
                        id="confirmPassword"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                        type="submit"
                        className={loading ? "loading" : "update-email-submit"}
                    >
                        Update Password
                    </button>
                    {passwordMessage && <p>{passwordMessage}</p>}
                </form>
            </div>

            <div className="exit">
                <button
                    onClick={() => navigate("/logout")}
                    className="sign-out-button"
                >
                    Sign Out
                </button>
                <button onClick={toggleModal} className="delete-account-button">
                    Delete Account
                </button>
            </div>
            <div className="delete-modal">
                {isModalOpen && (
                    <Modal onClose={toggleModal}>
                        <form onSubmit={handleDeleteSubmit}>
                            <a
                                onClick={toggleModal}
                                className="exit-modal-button"
                            >
                                X
                            </a>
                            <h1>Delete Account</h1>
                            <p>
                                If you delete your account, you will lose ALL
                                account information. This includes all chats
                                with Sensei and any subscriptions currently
                                active on the account. Only delete your account
                                if you are absolutely certain that you will no
                                longer need it.
                            </p>
                            <p>
                                Please type "delete my account" to confirm your
                                account deletion.
                            </p>
                            <div>
                                <input
                                    type="text"
                                    id="confirm"
                                    placeholder="delete my account"
                                    value={confirm}
                                    onChange={(e) => setConfirm(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={confirm !== "delete my account"}
                            >
                                DELETE ACCOUNT
                            </button>
                            {deleteErrorMessage && (
                                <p style={{ color: "red" }}>
                                    {deleteErrorMessage}
                                </p>
                            )}
                        </form>
                    </Modal>
                )}
            </div>
        </div>
    );
};

export default Settings;
