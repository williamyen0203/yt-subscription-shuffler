import React from "react";

interface ErrorComponentProps {
    error?: string;
}

export function ErrorComponent(props: ErrorComponentProps): JSX.Element {
    const { error } = props;

    return (
        <>
            {error && (
                <div className="card bg-red-200 text-xs">
                    <b>Error: </b> {error}
                </div>
            )}
        </>
    );
}
