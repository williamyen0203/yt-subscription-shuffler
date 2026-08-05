import React from "react";

interface ShuffleButtonComponentProps {
    selectedChannel?: GoogleApiYouTubeSubscriptionResource;
    selectedVideo?: GoogleApiYouTubePlaylistItemResource;
    loading?: boolean;
    excludedChannelIds?: string[];
    onRandomVideoClick: () => void;
    onExcludeChannel: (channelId: string) => void;
    onRemoveExcludedChannel: (channelId: string) => void;
}

export function ShuffleButtonComponent(
    props: ShuffleButtonComponentProps,
): JSX.Element {
    const {
        selectedChannel,
        selectedVideo,
        loading,
        excludedChannelIds,
        onRandomVideoClick,
        onExcludeChannel,
        onRemoveExcludedChannel,
    } = props;

    const selectedChannelId = selectedChannel?.snippet.resourceId.channelId;
    const isSelectedChannelExcluded =
        !!selectedChannelId &&
        !!excludedChannelIds?.includes(selectedChannelId);

    return (
        <>
            <button
                className={`btn shadow-lg block mx-auto mb-8 w-48 border-1 border-red-700 text-red-700 rounded-3xl ${
                    loading ? "opacity-50 cursor-wait" : ""
                }`}
                onClick={onRandomVideoClick}
                disabled={loading}
            >
                <img src="icon/icon128.png" alt="Icon" className="w-40 h-40" />{" "}
                <h1 className="pb-4">{loading ? "Shuffling..." : "Shuffle"}</h1>
            </button>
            <div className="mb-2 flex items-center">
                <div>
                    <b>Selected channel</b>
                    <br />
                    <span className="text-xs">
                        {selectedChannel
                            ? selectedChannel.snippet.title
                            : "None"}
                    </span>
                </div>
                {selectedChannelId && (
                    <button
                        className={`btn text-xs ml-2 ${
                            isSelectedChannelExcluded
                                ? "opacity-60"
                                : "border-red-700 text-red-700"
                        }`}
                        onClick={() =>
                            isSelectedChannelExcluded
                                ? onRemoveExcludedChannel(selectedChannelId)
                                : onExcludeChannel(selectedChannelId)
                        }
                    >
                        {isSelectedChannelExcluded ? "Re-include" : "Exclude"}
                    </button>
                )}
            </div>
            <div>
                <b>Selected video</b>
                <br />
                <span className="text-xs">
                    {selectedVideo ? selectedVideo.snippet.title : "None"}
                </span>
            </div>
        </>
    );
}
