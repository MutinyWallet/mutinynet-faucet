import { Component } from "solid-js";
import { token, login, logout } from "~/stores/auth";

export const AuthButton: Component = () => {
    return (
        <button
            onClick={() => token() ? logout() : login()}
            class="px-4 py-2 bg-blue-500 text-white rounded"
        >
            {token() ? "Logout" : "Login with GitHub"}
        </button>
    );
};