import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function Signup() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/signup', {
                email: formData.email,
                password: formData.password,
            });
            if (response.data.status === 'success') {
                console.log('Registration successful');
            } else {
                setError(response.data.error);
            }
        } catch (err) {
            console.error(err);
            setError('An error occurred during registration');
        }
    };
    return (
        <div>
            <h1>Create an Account</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email:</label>
                    <input type='email' name='email' value={formData.email} onChange={handleChange} />
                </div>
                <div>
                    <label>Password:</label>
                    <input type='password' name='password' value={formData.password} onChange={handleChange} />
                </div>
                <div>
                    <label>Confirm Password:</label>
                    <input type='password' name='confirmPassword' value={formData.confirmPassword} onChange={handleChange} />
                </div>
                <button type='submit' disabled={!formData.email || !formData.password || formData.password !== formData.confirmPassword}>Submit</button>
                {error && <p style={{ color: 'red'}}>{error}</p>}
                <p>Already have an account? <Link to='/signin'>Sign In</Link></p>
            </form>
        </div>
    );
}

export default Signup;
