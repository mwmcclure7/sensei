import React from 'react';

function navigateToSignIn() {
    window.location.href = '/signin';
}

function AccountCreated() {
    return (
        <div>
            <h1>Account Created</h1>
            <p>Your account has been successfully created.</p>
            <button onClick={navigateToSignIn} className='sign-in-button'>Sign In Now</button>
        </div>
    );
}

export default AccountCreated;