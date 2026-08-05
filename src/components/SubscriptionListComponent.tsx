import React, { useState } from "react";
import moment from "moment";

interface SubscriptionListComponentProps {
    lastUpdated?: number;
    subscriptions?: GoogleApiYouTubeSubscriptionResource[];
    excludedChannelIds?: string[];
    onFetchSubscriptionsClick: () => Promise<
        GoogleApiYouTubeSubscriptionResource[] | undefined
    >;
    onExcludeChannel: (channelId: string) => void;
    onRemoveExcludedChannel: (channelId: string) => void;
}

export function SubscriptionListComponent(
    props: SubscriptionListComponentProps,
): JSX.Element {
    const {
        lastUpdated,
        subscriptions,
        excludedChannelIds,
        onFetchSubscriptionsClick,
        onExcludeChannel,
        onRemoveExcludedChannel,
    } = props;

    const [showSubscriptionsList, setShowSubscriptionsList] = useState(false);

    const hasSubscriptions = subscriptions && subscriptions.length > 0;

    const isChannelExcluded = (channelId: string) =>
        !!excludedChannelIds?.includes(channelId);

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
                                const channelId =
                                    subscription.snippet.resourceId.channelId;
                                const excluded = isChannelExcluded(channelId);
                                return (
                                    <li
                                        key={`subscription-${i}`}
                                        className="flex justify-between items-center gap-2 py-1"
                                    >
                                        <span
                                            className={
                                                excluded
                                                    ? "line-through text-gray-400"
                                                    : ""
                                            }
                                        >
                                            {subscription.snippet.title}
                                        </span>
                                        <button
                                            className="text-xs btn"
                                            onClick={() =>
                                                excluded
                                                    ? onRemoveExcludedChannel(
                                                          channelId,
                                                      )
                                                    : onExcludeChannel(
                                                          channelId,
                                                      )
                                            }
                                        >
                                            {excluded
                                                ? "Un-exclude"
                                                : "Exclude"}
                                        </button>
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
