import axios from 'axios';
import React, { useState } from 'react';
import { Link, redirect } from 'react-router-dom';

const Signin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setErrorMessage('');

        try {
            const response = await axios.post('/api/signin', {
                email: email,
                password: password,
            });

            localStorage.setItem('token', response.data.token);
            redirect('/');

        } catch (error: any) {
            if (error.response) {
                setErrorMessage('Email or password is invalid');
            } else if (error.request) {
                setErrorMessage('The server did not respond. Please try again later.')
            } else {
                setErrorMessage('An error occurred. Please try again.')
            }
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <h1>Sign In</h1>
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
                <button type='submit' disabled={!email || !password}>Sign In</button>
                {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                <p>Don't have an account? <Link to='/signup'>Sign Up</Link></p>
            </form>
        </div>
    );
};

export default Signin;