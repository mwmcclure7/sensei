import React from "react";
import "../styles/Contact.css";

function Contact() {
    return (
        <div className="contact">
            <h1>
                For any support, bug-reports, feature-requests, or questions
                that artificial intelligence cannot answer, please contact a human at{" "}
                <a href="mailto:support@softwaresensei.ai" >
                    support@softwaresensei.ai
                </a>
                .
            </h1>
            <p>Because non-artificial intelligence is still smarter.</p>
            <p style={{ fontSize: "1.2vw" }}>At least in our support team.</p>
        </div>
    );
}

export default Contact;