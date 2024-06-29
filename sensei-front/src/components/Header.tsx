import React from 'react';
import './Header.css';
import logo from '../sensei-logo-t.svg';


const Header = () => {

    const isAuthenticated = localStorage.getItem('token') !== null;

    return (
        <header className='header'>
            <div className='left'>
                <img src={logo} alt='logo' className='logo' />
                <p>SoftwareSensei.ai</p>
            </div>
            <nav className='middle'>
                <a href='/'>Home</a>
                <a href='sensei'>Sensei</a>
                <a href='tokens'>Tokens</a>
            </nav>
            <div className='right'>
                {isAuthenticated ? (
                    <button onClick={() => window.location.href = '/settings'} className='profile-picture' />
                ) : (
                    <button onClick={() => window.location.href = '/signin'} className='sign-in-button'>Sign In</button>
                )}
            </div>
        </header>
    );
};

export default Header;
