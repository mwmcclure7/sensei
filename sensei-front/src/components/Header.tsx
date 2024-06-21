import React from 'react';
import './Header.css';
import logo from '../sensei-logo-t.svg';

const Header = () => {
    return (
        <header className='header'>
            <div className='left'>
                <img src={logo} alt='logo' className='logo' />
                <a href='' className='logo-word'>SoftwareSensei.ai</a>
            </div>
            <nav className='middle'>
                <a href=''>Home</a>
                <a href='#sensei'>Sensei</a>
                <a href='#tokens'>Tokens</a>
            </nav>
            <div className='right'>
                <button>Sign In</button>
            </div>
        </header>
    );
};

export default Header;
