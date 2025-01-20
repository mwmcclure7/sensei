import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../api";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants";
import { useState, useEffect } from "react";
import Spinner from "./Spinner";

/* Just a quick explanation for all of the @ts-ignore lines.
This worked before as a .jsx file. Then, I rewrote the frontend for Vite instead of create-react-app.
After I tried importing the file into App.tsx, I was getting an error because it is a .jsx file instead of a .tsx file.
So, I switched it to a .tsx file and fixed all errors, but then it no longer functioned.
My solution: just ignore all of the TypeScript errors and keep the original .jsx code. */

// @ts-ignore
function ProtectedRoute({ children }) {
    const [isAuthorized, setIsAuthorized] = useState(null);

    useEffect(() => {
        // @ts-ignore
        auth().catch(() => setIsAuthorized(false));

        window.addEventListener("auth", auth);
    }, []);

    const refreshToken = async () => {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN);
        try {
            const res = await api.post("/api/token/refresh/", {
                refresh: refreshToken,
            });
            if (res.status === 200) {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                // @ts-ignore
                setIsAuthorized(true);
            } else {
                // @ts-ignore
                setIsAuthorized(false);
            }
        } catch (error) {
            console.log(error);
            // @ts-ignore
            setIsAuthorized(false);
        }
    };

    const auth = async () => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (!token) {
            // @ts-ignore
            setIsAuthorized(false);
            return;
        }
        const decoded = jwtDecode(token);
        const tokenExpiration = decoded.exp;
        const now = Date.now() / 1000;

        // @ts-ignore
        if (tokenExpiration < now) {
            await refreshToken();
        } else {
            // @ts-ignore
            setIsAuthorized(true);
        }
    };

    if (isAuthorized === null) {
        return (
            <Spinner />
        );
    }

    return isAuthorized ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;
