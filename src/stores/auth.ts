import {createEffect, createSignal} from "solid-js";

// Create signals for auth state - initialize with localStorage value if available
export const [token, setToken] = createSignal<string | null>(
    typeof window !== 'undefined' ? localStorage.getItem("token") : null,
    { equals: false } // Force updates even if value is same
);


const FAUCET_API_URL = import.meta.env.VITE_FAUCET_API;

export const login = () => {
    window.location.href = `${FAUCET_API_URL}/auth/github`;
};

export const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
};
