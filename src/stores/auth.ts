import {createEffect, createSignal} from "solid-js";

// Check if window is defined (client-side)
const isClient = typeof window !== 'undefined';

// Create signals for auth state
export const [token, setToken] = createSignal<string | null>(
    isClient ? localStorage.getItem("token") : null
);


const FAUCET_API_URL = import.meta.env.VITE_FAUCET_API;

export const login = () => {
    window.location.href = `${FAUCET_API_URL}/auth/github`;
};

export const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
};
