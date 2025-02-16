import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";

function UpdateEmail() {
    const navigate = useNavigate();
    const { uid, token, signed_email } = useParams();

    useEffect(() => {
        if (!uid || !token || !signed_email) {
            navigate("/invalid-link");
            return;
        }

        api.post(`/api/reset-email/${uid}/${token}/${signed_email}/`)
            .then((res) => res.data)
            .then((data) => {
                if (data.status === "success") {
                    navigate("/email-updated");
                } else {
                    navigate("/invalid-link");
                }
            })
            .catch(() => {
                navigate("/invalid-link");
            });
    }, [uid, token, signed_email, navigate]);

    return null;
}

export default UpdateEmail;
