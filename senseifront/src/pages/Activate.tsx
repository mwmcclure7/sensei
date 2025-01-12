import { useEffect } from "react";
import api from "../api";

function Activate() {
    useEffect(() => {
        const currentUrl = window.location.pathname;
        const parts = currentUrl.split("/");
        const uidb64 = parts[parts.length - 2];
        const token = parts[parts.length - 1];

        api.post(`/api/activate/${uidb64}/${token}/`)
            .then((res) => res.data)
            .then((data) => {
                if (data.status === "success") {
                    window.location.href = "/login";
                } else {
                    window.location.href = "/invalid-link";
                }
            });
    }, []);

    return null;
}

export default Activate;
