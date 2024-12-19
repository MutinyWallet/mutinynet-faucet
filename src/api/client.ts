import {setToken, token} from "~/stores/auth";

const FAUCET_API_URL = import.meta.env.VITE_FAUCET_API;

export const api = {
    get: async (url: string) => {
        const response = await fetch(`${FAUCET_API_URL}/${url}`, {
            headers: {
                Authorization: `Bearer ${token()}`,
            },
        });

        if (response.status === 401) {
            // Handle unauthorized
            setToken(null);
            localStorage.removeItem("token");
            window.location.href = "/";
            return;
        }

        return response.json();
    },
};