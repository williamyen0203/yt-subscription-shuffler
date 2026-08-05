import React from "react";

interface ShuffleButtonComponentProps {
    selectedChannel?: GoogleApiYouTubeSubscriptionResource;
    selectedVideo?: GoogleApiYouTubePlaylistItemResource;
    loading?: boolean;
    onRandomVideoClick: () => void;
}

export function ShuffleButtonComponent(
    props: ShuffleButtonComponentProps,
): JSX.Element {
    const { selectedChannel, selectedVideo, loading, onRandomVideoClick } =
        props;

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
            <div className="mb-2">
                <b>Selected channel</b>
                <br />
                <span className="text-xs">
                    {selectedChannel ? selectedChannel.snippet.title : "None"}
                </span>
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
