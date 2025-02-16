import { Link } from "react-router-dom";

function Activated() {
    return (
        <div className="message">
            <h1>Account Created</h1>
            <p>Click the link sent to your email to activate your account.</p>
            <Link to="/login">Sign in</Link>
        </div>
    );
}

export default Activated;
