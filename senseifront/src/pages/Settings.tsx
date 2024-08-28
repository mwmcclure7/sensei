import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
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
    // Delete account functionality
    const [isModalOpen, setModalOpen] = useState(false);
    const [confirm, setConfirm] = useState("");

    const navigate = useNavigate();

    const toggleModal = () => setModalOpen(!isModalOpen);

    const handleDeleteSubmit = async (e: any) => {
        e.preventDefault();

        try {
            await api.post("/api/deactivate-account/");
        } catch (error) {
            toast.error("An error occurred. Please try again.");
        } finally {
            localStorage.clear();
            window.dispatchEvent(new CustomEvent("login"));
            navigate("/");
        }
    };

    // Update account functionality
    const [info, setInfo] = useState("");
    const [infoLoading, setInfoLoading] = useState(false);

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
        setInfoLoading(true);

        try {
            await api.post("/api/update-profile/", {
                info: info,
            });
            toast.success("Profile updated successfully.");
        } catch (error) {
            alert(error);
        } finally {
            setInfoLoading(false);
        }
    };

    // Change email functionality
    const [email, setEmail] = useState("");
    const [emailLoading, setEmailLoading] = useState(false);

    const handleEmailSubmit = async (e: any) => {
        e.preventDefault();
        setEmailLoading(true);
        try {
            await api.post("/api/update-email-request/", {
                email: email,
            });
        } catch (error) {
            alert(error);
        } finally {
            toast.success(
                "An email has been sent to this address for confirmation.",
                { duration: 5000 }
            );
            setEmailLoading(false);
        }
    };

    // Change password functionality
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordLoading, setPasswordLoading] = useState(false);

    const handlePasswordSubmit = async (e: any) => {
        e.preventDefault();
        setPasswordLoading(true);
        try {
            if (password !== confirmPassword) {
                toast.error("Passwords do not match.");
            } else if (password.length < 8) {
                toast.error("Password must be at least 8 characters long.");
            } else {
                await api.post("/api/update-password/", {
                    password: password,
                });
                setPassword("");
                setConfirmPassword("");
                toast.success("Your password has been updated.");
            }
        } catch (error) {
            alert(error);
        } finally {
            setPasswordLoading(false);
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
                    className={
                        infoLoading ? "loading" : "update-profile-submit"
                    }
                >
                    Update Profile
                </button>
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
                        className={
                            emailLoading ? "loading" : "update-email-submit"
                        }
                    >
                        Update Email
                    </button>
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
                        className={
                            passwordLoading ? "loading" : "update-email-submit"
                        }
                    >
                        Update Password
                    </button>
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
                        </form>
                    </Modal>
                )}
            </div>
        </div>
    );
};

export default Settings;
