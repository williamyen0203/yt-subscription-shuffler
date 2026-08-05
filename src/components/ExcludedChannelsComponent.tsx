import React, { useState } from "react";

interface ExcludedChannelsComponentProps {
    subscriptions?: GoogleApiYouTubeSubscriptionResource[];
    excludedChannelIds?: string[];
    onRemoveExcludedChannel: (channelId: string) => void;
}

export function ExcludedChannelsComponent(
    props: ExcludedChannelsComponentProps,
): JSX.Element {
    const { subscriptions, excludedChannelIds, onRemoveExcludedChannel } =
        props;

    const [showExcludedList, setShowExcludedList] = useState(true);

    const excludedChannels =
        excludedChannelIds
            ?.map((channelId) => ({
                channelId: channelId,
                title: subscriptions?.find(
                    (subscription) =>
                        subscription.snippet.resourceId.channelId === channelId,
                )?.snippet.title,
            }))
            .sort((a, b) =>
                (a.title ?? a.channelId).localeCompare(b.title ?? b.channelId),
            ) ?? [];

    return (
        <div>
            <div
                className="text-left flex flex-row gap-1 cursor-pointer"
                onClick={() => setShowExcludedList(!showExcludedList)}
            >
                <h1>{showExcludedList ? <>▾</> : <>▸</>}</h1>
                <b>Excluded channels ({excludedChannels.length})</b>
            </div>
            {showExcludedList &&
                (excludedChannels.length === 0 ? (
                    <p className="text-gray-600 text-xs">
                        No channels excluded. Excluded channels show up here.
                    </p>
                ) : (
                    <div className="py-2 bg-slate-50 border border-solid border-slate-300 max-h-96 overflow-y-scroll">
                        <ol>
                            {excludedChannels.map((channel) => (
                                <li
                                    key={channel.channelId}
                                    className="flex justify-between items-center gap-2 py-1"
                                >
                                    <span>
                                        {channel.title ?? channel.channelId}
                                    </span>
                                    <button
                                        className="text-xs btn"
                                        onClick={() =>
                                            onRemoveExcludedChannel(
                                                channel.channelId,
                                            )
                                        }
                                    >
                                        Re-include
                                    </button>
                                </li>
                            ))}
                        </ol>
                    </div>
                ))}
        </div>
    );
}
