import React from "react";

function Contact() {
    return (
        <div className="message">
            <h1>
                For any support, bug-reports, feature-requests, or questions
                that Sensei cannot answer, please contact a human at{" "}
                <a href="mailto:support@softwaresensei.ai" >
                    support@softwaresensei.ai
                </a>
                .
            </h1>
            <p>Because non-artificial intelligence is still smarter.</p>
            <p style={{ fontSize: "1vw" }}>At least for our support team.</p>
        </div>
    );
}

export default Contact;