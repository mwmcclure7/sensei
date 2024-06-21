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
                <div className='why0'>
                    <div className='why1'>
                        <h2>Personalized Learning</h2>
                        <div className='why2'>
                            <img src={learning} alt='icon' className='icon'/>
                            <p>With one-on-one AI tutoring, Sensei adapts to your unique learning style, optimizing lessons for enhanced effectiveness.</p>
                        </div>
                    </div>
                    <div className='why1'>
                        <h2>24/7 Availability</h2>
                        <div className='why2'>
                            <img src={time} alt='icon' className='icon'/>
                            <p>Sensei is always ready to teach. Access your personal AI tutor anytime, day or night, to fit your schedule and pace.</p>
                        </div>
                    </div>
                </div>
                <div className='why0'>
                    <div className='why1'>
                        <h2>Expert AI Tutor</h2>
                        <div className='why2'>
                            <img src={tutor} alt='icon' className='icon'/>
                            <p>Sensei is optimized for teaching programming, providing expert guidance and support tailored to your learning needs.</p>
                        </div>
                    </div>
                    <div className='why1'>
                        <h2>Interactive Lessons</h2>
                        <div className='why2'>
                            <img src={interactive} alt='icon' className='icon'/>
                            <p>Talking through lessons with Sensei is more effective than passively reading or watching videos, as it encourages questions and active engagement with the course content.</p>
                        </div>
                    </div>
                </div>
            </section>
            <hr />
            <section className='section4'>
                <h1>How it Works</h1>
                <p className='s4-caption'>Whether you're a complete beginner unsure where to start or an experienced developer seeking to learn a specific skill, Sensei is here to streamline your programming journey. Our platform helps you spend less time learning and more time developing, regardless of your current level.</p>
                <div className='how'>
                    <p className='bullet'>1</p>
                    <div className='description'>
                        <h2>Define Your Learning Path</h2>
                        <p>Ask Sensei about the right learning path to achieve your goals as a developer. Sensei will assess your current level and recommend a personalized roadmap.</p>
                    </div>
                </div>
                <div className='how'>
                    <p className='bullet'>2</p>
                    <div className='description'>
                        <h2>Specify Your Focus</h2>
                        <p>Request to learn a particular language or framework, allowing Sensei to structure a tailored course for you. This ensures your learning is relevant and aligned with your objectives.</p>
                    </div>
                </div>
                <div className='how'>
                    <p className='bullet'>3</p>
                    <div className='description'>
                        <h2>Receive Lectures and Guidance</h2>
                        <p>For each unit, Sensei provides comprehensive lectures and guidance to build a strong foundation. You'll gain a clear understanding of core concepts before moving on.</p>
                    </div>
                </div>
                <div className='how'>
                    <p className='bullet'>4</p>
                    <div className='description'>
                        <h2>Engage in Project-Based Learning</h2>
                        <p>Work on meaningful projects that align with your interests, applying what you've learned in a practical context. Project-based learning ensures you gain hands-on experience.</p>
                    </div>
                </div>
                <div className='how'>
                    <p className='bullet'>5</p>
                    <div className='description'>
                        <h2>Recieve Personalized Feedback</h2>
                        <p>Receive tailored feedback and support from Sensei to refine your skills and enhance your understanding. This personalized approach helps you overcome challenges and improve continuously.</p>
                    </div>
                </div>
                <h1>Ready to Get Started?</h1>
                <button>Sign Up Now</button>
            </section>
            <hr />
            <section className='about'>
                <h1>About SENSEI.AI LLC</h1>
                <p className='description'>SENSEI.AI LLC was founded in 2024 with the goal of using technology to modernize education. In the past, education could only be achieved by attending group classes, hiring a personal tutor, or using available books and online resources to self-educate. The recent growth of generative AI, however, adds an additional solution: education through AI. At SENSEI.AI, we believe that artificial intelligence has the potential to revolutionize the way we learn, as it is more affordable and accessible than hiring a tutor or enrolling in a class, while also being more personalized and interacitve than previous mediums of self-education. We also believe that as AI becomes more sophisticated, it will become increasingly important to be able to pass on knowledge learned by AI back to humans. It is our hope that Sensei can be a step toward improved communication between people and AI so humanity can benefit from the knowledge it gains.</p>
            </section>
        </body>
    );
};

export default Home;
