import React, { useState } from "react";
import axios from "axios";
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
    const [isModalOpen, setModalOpen] = useState(false);
    const [confirm, setConfirm] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const navigate = useNavigate();

    const toggleModal = () => setModalOpen(!isModalOpen);

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        setErrorMessage("");

        try {
            await api.post("/api/deactivate-account/");
        } catch (error) {
            setErrorMessage("An error occurred. Please try again.");
        } finally {
            localStorage.clear();
            window.dispatchEvent(new CustomEvent("login"));
            navigate("/");
        }
    };

    return (
        <div className='settings'>
            <h1>Settings</h1>
            <button onClick={() => navigate("/logout")} className="sign-out-button">
                Sign Out
            </button>
            <button onClick={toggleModal} className="delete-account-button">
                Delete Account
            </button>
            {isModalOpen && (
                <Modal onClose={toggleModal}>
                    <form onSubmit={handleSubmit}>
                        <h1>Delete Account</h1>
                        <p>
                            If you delete your account, you will lose ALL
                            account information. This includes all chats with
                            Sensei and any subscriptions currently active on the
                            account. Only delete your account if you are
                            absolutely certain that you will no longer need it.
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
                        <button type="submit" disabled={confirm !== "delete my account"}>
                            DELETE ACCOUNT
                        </button>
                        {errorMessage && (
                            <p style={{ color: "red" }}>{errorMessage}</p>
                        )}
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default Settings;
