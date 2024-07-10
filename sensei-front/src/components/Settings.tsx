import React, { useState } from 'react';
import axios from 'axios';
import '../App.css'

function signOut() {
    localStorage.removeItem('token');
    window.location.href = '/signin';
}

const Modal = ({ onClose, children }: { onClose: () => void; children: React.ReactNode }) => {
    return (
        <div className='modal' onClick={onClose}>
            <div className='modal-content' onClick={e => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
}

const Settings = () => {
    const [isModalOpen, setModalOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const toggleModal = () => setModalOpen(!isModalOpen);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setErrorMessage('');

        try {
            await axios.post('http://localhost:8000/api/deactivate-account/', {
                email: email,
                password: password,
            });

            signOut();
            window.location.href = '/sensei';;

        } catch (error: any) {
            if (error.response) {
                setErrorMessage('Email or password is invalid');
            } else if (error.request) {
                setErrorMessage('The server did not respond. Please try again later.');
            } else {
                setErrorMessage('An error occurred. Please try again.');
            }
        }
    };

    return (
        <div>
            <h1>Settings</h1>
            <button onClick={signOut} className='sign-out-button'>Sign Out</button>
            <button onClick={toggleModal} className='delete-account-button'>Delete Account</button>
            {isModalOpen && (
                <Modal onClose={toggleModal}>
                    <form>
                        <h1>Delete Account</h1>
                        <p>If you delete your account, you will lose ALL account information. This includes all chats with Sensei and any subscriptions currently active on the account. Only delete your account if you are absolutely certain that you will no longer need it.</p>
                        <p>Retype your email and password to confirm your account deletion.</p>
                        <div>
                            <label htmlFor='email'>Email:</label>
                            <input
                                type='email'
                                id='email'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor='password'>Password:</label>
                            <input
                                type='password'
                                id='password'
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <button type='submit' disabled={!email || !password}>DELETE ACCOUNT</button>
                        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default Settings;