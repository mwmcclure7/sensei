import React from "react";
import "../styles/Home.css";
import Footer from "./Footer";
import interactive from "../assets/interactive.svg";
import learning from "../assets/learning.svg";
import time from "../assets/time.svg";
import tutor from "../assets/tutor.svg";

function Home() {
    return (
        <div className="home">
            <section className="section1">
                <p className="title">
                    Introducing <span className="sensei">sensei</span>
                </p>
            </section>
            <hr />
            <section className="section2">
                <h1>Master Software Skills with AI-Powered Tutoring</h1>
                <p>
                    Personalized, project-based tutoring so you can learn
                    programming effectively.
                </p>
                <button onClick={() => {window.location.href = "/register"}}>Get Started</button>
            </section>
            <hr />
            <section className="section3">
                <h1>Why Learn with AI?</h1>
                <div className="why0">
                    <div className="why1">
                        <h2>Personalized Courses</h2>
                        <div className="why2">
                            <img src={learning} alt="icon" className="icon" />
                            <p>
                                With one-on-one AI tutoring, Sensei adapts to
                                your unique learning style, optimizing lessons
                                for enhanced effectiveness.
                            </p>
                        </div>
                    </div>
                    <div className="why1">
                        <h2>24/7 Availability</h2>
                        <div className="why2">
                            <img src={time} alt="icon" className="icon" />
                            <p>
                                Sensei is always ready to teach. Access your
                                personal AI tutor anytime, day or night, to fit
                                your schedule and pace.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="why0">
                    <div className="why1">
                        <h2>Expert AI Tutor</h2>
                        <div className="why2">
                            <img src={tutor} alt="icon" className="icon" />
                            <p>
                                Sensei is optimized for teaching programming,
                                providing expert guidance and support tailored
                                to your learning needs.
                            </p>
                        </div>
                    </div>
                    <div className="why1">
                        <h2>Project-Based Learning</h2>
                        <div className="why2">
                            <img
                                src={interactive}
                                alt="icon"
                                className="icon"
                            />
                            <p>
                                Sensei teaches you to code through projects that
                                you have a personal interest in. You will not
                                only gain essential programming knowledge, but
                                also know how to apply this knowledge to real
                                world scenarios.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
            <hr />
            <section className="section4">
                <h1>How it Works</h1>
                <p className="s4-caption">
                    Whether you're a complete beginner unsure where to start or
                    an experienced developer seeking to learn a specific skill,
                    Sensei is here to streamline your programming journey. Our
                    platform helps you spend less time learning and more time
                    developing, regardless of your current level.
                </p>
                <div className="how">
                    <p className="bullet">1</p>
                    <div className="description">
                        <h2>Specify your Focus</h2>
                        <p>
                            Request to learn a particular language or framework.
                            Unsure of where to start? Talk to Sensei about
                            different learning paths to achieve your goals as a
                            developer.
                        </p>
                    </div>
                </div>
                <div className="how">
                    <p className="bullet">2</p>
                    <div className="description">
                        <h2>Identify a Project</h2>
                        <p>
                            Identify a long-term project that you would like to
                            work on as you gain the skills you selected in the
                            previous step. Sensei will teach you these skills
                            while guiding you through your project.
                        </p>
                    </div>
                </div>
                <div className="how">
                    <p className="bullet">3</p>
                    <div className="description">
                        <h2>Receive Lecture</h2>
                        <p>
                            For each step in your project, Sensei provides
                            comprehensive lectures to build a fundamental
                            understanding of a concept before applying it to
                            your project.
                        </p>
                    </div>
                </div>
                <div className="how">
                    <p className="bullet">4</p>
                    <div className="description">
                        <h2>Apply What You Learned</h2>
                        <p>
                            Sensei will guide you through applying what you
                            learned to your project. You will be prompted to add
                            certain functionality to your project and Sensei
                            will provide assistance when necessary.
                        </p>
                    </div>
                </div>
                <div className="how">
                    <p className="bullet">5</p>
                    <div className="description">
                        <h2>Recieve Personalized Feedback</h2>
                        <p>
                            Receive tailored feedback and support from Sensei to
                            refine your skills and enhance your understanding.
                            This personalized approach helps you overcome
                            challenges and improve continuously.
                        </p>
                    </div>
                </div>
                <h1>Ready to Get Started?</h1>
                <button onClick={() => {window.location.href = "/register"}}>Sign Up Now</button>
            </section>
            <hr />
            <section className="about">
                <h1>About SENSEI.AI LLC</h1>
                <p className="description">
                    SENSEI.AI LLC was founded in 2024 with the goal of using
                    technology to modernize education. In the past, education
                    could only be achieved by attending group classes, hiring a
                    personal tutor, or using available books and online
                    resources to self-educate. The recent growth of generative
                    AI, however, adds an additional solution: education through
                    AI. At SENSEI.AI, we believe that artificial intelligence
                    has the potential to revolutionize the way we learn, as it
                    is more affordable and accessible than hiring a tutor or
                    enrolling in a class, while also being more personalized and
                    interacitve than previous mediums of self-education. We also
                    believe that as AI becomes more sophisticated, it will
                    become increasingly important to be able to pass on
                    knowledge learned by AI back to humans. It is our hope that
                    Sensei can be a step toward improved communication between
                    people and AI so humanity can benefit from the knowledge it
                    gains.
                </p>
            </section>
            <Footer />
        </div>
    );
};

export default Home;
