import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";

function Activate() {
    const { uid, token } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (!uid || !token) {
            navigate("/invalid-link");
            return;
        }

        api.post(`/api/activate/${uid}/${token}/`)
            .then((res) => res.data)
            .then((data) => {
                if (data.status === "success") {
                    navigate("/login");
                } else {
                    navigate("/invalid-link");
                }
            })
            .catch(() => {
                navigate("/invalid-link");
            });
    }, [uid, token, navigate]);

    return null;
}

export default Activate;
