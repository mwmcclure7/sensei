import { Link } from "react-router-dom";

function EmailUpdated() {
    return (
        <div className="message">
            <h1>Email Successfully Updated</h1>
            <Link to="/login">Sign in</Link>
        </div>
    );
}

export default EmailUpdated;