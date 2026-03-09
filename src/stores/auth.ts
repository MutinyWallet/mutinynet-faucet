import {createSignal} from "solid-js";

// GitHub OAuth Bearer token
export const [token, setToken] = createSignal<string | null>(
    typeof window !== 'undefined' ? localStorage.getItem("token") : null,
    { equals: false }
);

// L402 credential (token:preimage)
export const [l402Credential, setL402Credential] = createSignal<string | null>(
    typeof window !== 'undefined' ? localStorage.getItem("l402Credential") : null,
    { equals: false }
);

// Whether the user is authenticated by any method
export const isAuthed = () => !!token() || !!l402Credential();

const FAUCET_API_URL = import.meta.env.VITE_FAUCET_API;

export const login = () => {
    window.location.href = `${FAUCET_API_URL}/auth/github`;
};

export const loginL402 = (l402Token: string, preimage: string) => {
    const credential = `${l402Token}:${preimage}`;
    localStorage.setItem("l402Credential", credential);
    setL402Credential(credential);
};

export const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("l402Credential");
    setToken(null);
    setL402Credential(null);
};
