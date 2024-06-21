import React from 'react';
import './Home.css';
import interactive from '../icons/interactive.png';
import learning from '../icons/learning.png';
import time from '../icons/time.png';
import tutor from '../icons/tutor.png';

const Home = () => {
    return (
        <body className='home'>
            <section className='section1'>
                <p className='title'>Introducing <span className='sensei'>sensei</span></p>
            </section>
            <hr />
            <section className='section2'>
                <h1>Master Software Skills with AI-Powered Tutoring</h1>
                <p>Personalized, one-on-one tutoring to help you learn programming effectively.</p>
                <button>Get Started</button>
            </section>
            <hr />
            <section className='section3'>
                <h1>Why Learn with AI?</h1>
                <div className='how0'>
                    <div className='how1'>
                        <h2>Personalized Learning</h2>
                        <div className='how2'>
                            <img src={learning} alt='icon' className='icon'/>
                            <p>With one-on-one AI tutoring, Sensei adapts to your unique learning style, optimizing lessons for enhanced effectiveness.</p>
                        </div>
                    </div>
                    <div className='how1'>
                        <h2>24/7 Availability</h2>
                        <div className='how2'>
                            <img src={time} alt='icon' className='icon'/>
                            <p>Sensei is always ready to teach. Access your personal AI tutor anytime, day or night, to fit your schedule and pace.</p>
                        </div>
                    </div>
                </div>
                <div className='how0'>
                    <div className='how1'>
                        <h2>Expert AI Tutor</h2>
                        <div className='how2'>
                            <img src={tutor} alt='icon' className='icon'/>
                            <p>Sensei is optimized for teaching programming, providing expert guidance and support tailored to your learning needs.</p>
                        </div>
                    </div>
                    <div className='how1'>
                        <h2>Interactive Lessons</h2>
                        <div className='how2'>
                            <img src={interactive} alt='icon' className='icon'/>
                            <p>Talking through lessons with Sensei is more effective than passively reading or watching videos, as it encourages questions and active engagement with the course content.</p>
                        </div>
                    </div>
                </div>
            </section>
            <hr />

        </body>
    );
};

export default Home;
