import {l402Credential, setL402Credential, setToken, token} from "~/stores/auth";

const FAUCET_API_URL = import.meta.env.VITE_FAUCET_API;

function authHeader(): string {
    const l402 = l402Credential();
    if (l402) {
        return `L402 ${l402}`;
    }
    return `Bearer ${token()}`;
}

export const api = {
    get: async (url: string) => {
        const response = await fetch(`${FAUCET_API_URL}/${url}`, {
            headers: {
                Authorization: authHeader(),
            },
        });

        if (response.status === 401) {
            // Handle unauthorized - clear whichever credential was used
            if (l402Credential()) {
                localStorage.removeItem("l402Credential");
                setL402Credential(null);
            } else {
                localStorage.removeItem("token");
                setToken(null);
            }
            window.location.href = "/";
        }

        return response;
    },
    post: async (url: string, body: any) => {
        const response = await fetch(`${FAUCET_API_URL}/${url}`, {
            method: "POST",
            body: JSON.stringify(body),
            headers: {
                Authorization: authHeader(),
                "Content-Type": "application/json",
            },
        });

        if (response.status === 401) {
            if (l402Credential()) {
                localStorage.removeItem("l402Credential");
                setL402Credential(null);
            } else {
                localStorage.removeItem("token");
                setToken(null);
            }
            window.location.href = "/";
        }

        return response;
    },
};
