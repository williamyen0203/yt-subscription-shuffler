import React, { useState } from "react";
import moment from "moment";

interface SubscriptionListComponentProps {
    lastUpdated?: number;
    subscriptions?: GoogleApiYouTubeSubscriptionResource[];
    onFetchSubscriptionsClick: () => Promise<
        GoogleApiYouTubeSubscriptionResource[] | undefined
    >;
}

export function SubscriptionListComponent(
    props: SubscriptionListComponentProps,
): JSX.Element {
    const { lastUpdated, subscriptions, onFetchSubscriptionsClick } = props;

    const [showSubscriptionsList, setShowSubscriptionsList] = useState(false);

    const hasSubscriptions = subscriptions && subscriptions.length > 0;

    return (
        <div>
            <div className="flex justify-between mb-4">
                <div
                    className="text-left flex flex-row gap-1 cursor-pointer"
                    onClick={() => {
                        if (hasSubscriptions)
                            setShowSubscriptionsList(!showSubscriptionsList);
                    }}
                >
                    {hasSubscriptions && (
                        <h1>{showSubscriptionsList ? <>▾</> : <>▸</>}</h1>
                    )}
                    <div>
                        <b className="mb-1">
                            Subscriptions List ({subscriptions?.length})
                        </b>
                        <p className="text-gray-600 text-xs">
                            Last updated:{" "}
                            {lastUpdated
                                ? moment(lastUpdated).format(
                                      "MM/D/YY h:mm:ss a",
                                  )
                                : "Never"}
                        </p>
                    </div>
                </div>
                <button
                    className="btn text-right"
                    onClick={onFetchSubscriptionsClick}
                >
                    ⟳ Refresh
                </button>
            </div>
            {showSubscriptionsList && (
                <div className="py-2 bg-slate-50 border border-solid border-slate-300 max-h-96 overflow-y-scroll">
                    <ol>
                        {subscriptions?.map(
                            (
                                subscription: GoogleApiYouTubeSubscriptionResource,
                                i: number,
                            ) => {
                                return (
                                    <li key={`subscription-${i}`}>
                                        {subscription.snippet.title}
                                    </li>
                                );
                            },
                        )}
                    </ol>
                </div>
            )}
        </div>
    );
}
