import React from "react";

interface LoginComponentProps {
    token?: string;
    user?: string;
    onSignOutClick: () => void;
    onAuthClick: () => void;
}

export function LoginComponent(props: LoginComponentProps): JSX.Element {
    const { token, user, onSignOutClick, onAuthClick } = props;

    return (
        <div className="card flex justify-between">
            {token ? (
                <>
                    <div className="text-left">
                        <span>Logged in as</span>
                        <br />
                        <b>{user}</b>
                    </div>
                    <button className="btn text-right" onClick={onSignOutClick}>
                        Sign out
                    </button>
                </>
            ) : (
                <>
                    <span className="text-left">You must log in first.</span>
                    <button className="btn text-right" onClick={onAuthClick}>
                        Login
                    </button>
                </>
            )}
        </div>
    );
}
