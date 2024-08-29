import { useEffect } from "react";
import api from "../api";

function UpdateEmail() {
    useEffect(() => {
        const currentUrl = window.location.pathname;
        const parts = currentUrl.split("/");
        const uidb64 = parts[parts.length - 3];
        const token = parts[parts.length - 2];
        const signed_email = parts[parts.length - 1];

        api.post(`/api/reset-email/${uidb64}/${token}/${signed_email}`)
            .then((res) => res.data)
            .then((data) => {
                if (data.status === "success") {
                    window.location.href = "/email-updated";
                } else {
                    window.location.href = "/invalid-link";
                }
            });
    }, []);

    return null;
}

export default UpdateEmail;
