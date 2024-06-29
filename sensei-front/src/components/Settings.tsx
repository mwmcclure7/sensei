import React from 'react';

function signOut() {
    localStorage.removeItem('token');
    window.location.href = '/signin';
}

const Settings = () => {
    return (
        <div>
            <h1>Settings</h1>
            <button onClick={signOut} className='sign-out-button'>Sign Out</button>
        </div>
    );
};

export default Settings;