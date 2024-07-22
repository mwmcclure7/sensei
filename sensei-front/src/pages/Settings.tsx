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
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [info, setInfo] = useState("");

    const fetchUserData = async () => {
        try {
            const response = await api.get("/api/get-profile/");
            setFirstName(response.data.first_name);
            setLastName(response.data.last_name);
            setDateOfBirth(response.data.date_of_birth);
            setInfo(response.data.info);
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

        try {
            await api.post("/api/update-profile/", {
                first_name: firstName,
                last_name: lastName,
                date_of_birth: dateOfBirth,
                info: info,
            });
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
                <div>
                    <label htmlFor="firstName">First Name</label>
                    <input
                        type="text"
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="lastName">Last Name</label>
                    <input
                        type="text"
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="dateOfBirth">Date of Birth</label>
                    <input
                        type="date"
                        id="dateOfBirth"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                    />
                </div>
                <div className="info-div">
                    <label htmlFor="info" className="info-label">Enter additional information you want Sensei to know for further personalization, such as skills or prior experience.</label>
                    <textarea
                        id="info"
                        value={info}
                        onChange={(e) => setInfo(e.target.value)}
                        maxLength={500}
                    />
                </div>
                <button type="submit" className="update-profile-submit">Update Profile</button>
            </form>

            <button
                onClick={() => navigate("/logout")}
                className="sign-out-button"
            >
                Sign Out
            </button>
            <button onClick={toggleModal} className="delete-account-button">
                Delete Account
            </button>
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
