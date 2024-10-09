import React, { useEffect } from "react";
import { useState } from "react";
import { GoogleApiClient } from "../googleapi/GoogleApiClient";
import useChromeStorage from "../hooks/UseChromeStorage";
import moment from "moment";

export function ShufflerComponent(): JSX.Element {
    const [error, setError] = useState<string>();
    const [user, setUser] = useState<string>();
    const [token, setToken] = useChromeStorage<string>("oauthToken", "d");
    const [subscriptions, setSubscriptions] = useChromeStorage<
        GoogleApiYouTubeSubscriptionResource[]
    >("subscriptions", []);

    const [selectedChannel, setSelectedChannel] =
        useState<GoogleApiYouTubeSubscriptionResource>();
    const [selectedVideo, setSelectedVideo] =
        useState<GoogleApiYouTubeSearchResource>();

    const [showSubscriptionsList, setShowSubscriptionsList] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date>();

    const gapiClient = new GoogleApiClient();

    const onAuthClick = async () => {
        gapiClient
            .authenticate()
            .then((token) => {
                setToken(token);
            })
            .catch((error) => {
                setError(error.message);
            });
    };

    // Clear out errors after 5 seconds
    useEffect(() => {
        setInterval(() => {
            setError(undefined);
        }, 5000);
    }, [error]);

    // Reset state after logging out
    useEffect(() => {
        if (token) {
            gapiClient
                .getSignedInUserEmail()
                .then((email) => {
                    setUser(email);
                })
                .catch((error) => {
                    setError(error.message);
                });
        } else {
            setUser(undefined);
            setSubscriptions([]);
            setSelectedChannel(undefined);
            setSelectedVideo(undefined);
        }
    }, [token]);

    const onSignOutClick = () => {
        if (token) {
            gapiClient
                .signOut(token)
                .then(() => {
                    setToken("");
                })
                .catch((error) => {
                    setError(error.message);
                });
        }
    };

    const onFetchSubscriptionsClick = async () => {
        if (!token) {
            setError("Not logged in");
            return;
        }

        let nextPageToken = null;
        let subscriptions: GoogleApiYouTubeSubscriptionResource[] = [];
        do {
            try {
                const response: GoogleApiYouTubePaginationInfo<GoogleApiYouTubeSubscriptionResource> =
                    await gapiClient.fetchSubscriptions(token, nextPageToken);
                subscriptions = [...subscriptions, ...response.items];
                nextPageToken = response.nextPageToken;
            } catch (e) {
                if (e instanceof Error) {
                    setError(e.message);
                    return;
                }
            }
        } while (nextPageToken != null);

        setSubscriptions(subscriptions);
        setLastUpdated(new Date());
    };

    const onRandomVideoClick = async () => {
        if (!token) {
            setError("Not logged in");
            return;
        }

        // TODO: Handle case where user has no subscriptions
        if (!subscriptions || subscriptions.length == 0) {
            onFetchSubscriptionsClick();
        }

        if (!subscriptions || subscriptions.length == 0) {
            setError("Subscriptions not fetched");
            return;
        }

        // Pick a random channel
        const randomSubscription =
            subscriptions[Math.floor(Math.random() * subscriptions.length)];
        setSelectedChannel(randomSubscription);
        const randomChannelId = randomSubscription.snippet.resourceId.channelId;

        // Fetch all videos from channel
        let nextPageToken = null;
        let channelVideos: GoogleApiYouTubeSearchResource[] = [];
        do {
            try {
                const searchResults = await gapiClient.fetchVideos(
                    token,
                    randomChannelId,
                );

                channelVideos = [...channelVideos, ...searchResults.items];

                nextPageToken = searchResults.nextPageToken;
            } catch (error) {
                if (error instanceof Error) {
                    setError(error.message);
                    return;
                }
            }
        } while (nextPageToken != null);

        // Pick a random video from channel
        const randomVideo =
            channelVideos[Math.floor(Math.random() * channelVideos.length)];
        setSelectedVideo(randomVideo);
        const randomVideoId = randomVideo.id.videoId;
        const videoUrl = `https://www.youtube.com/watch?v=${randomVideoId}`;

        openLinkInNewTab(videoUrl);
    };

    const openLinkInNewTab = (url: string) => {
        chrome.tabs.create({ url: url }, (tab) => {
            console.log("New tab created: " + tab);
        });
    };

    return (
        <div className="py-2 px-2 flex flex-col gap-2">
            {error && (
                <div className="card bg-red-200 text-xs">
                    <b>Error: </b> {error}
                </div>
            )}

            <div className="card flex justify-between">
                {user ? (
                    <>
                        <div className="text-left">
                            <span>Logged in as</span>
                            <br />
                            <b>{user}</b>
                        </div>
                        <button
                            className="btn text-right"
                            onClick={onSignOutClick}
                        >
                            Sign out
                        </button>
                    </>
                ) : (
                    <>
                        <span className="text-left">
                            You must log in first.
                        </span>
                        <button
                            className="btn text-right"
                            onClick={onAuthClick}
                        >
                            Login
                        </button>
                    </>
                )}
            </div>

            {user && (
                <>
                    <div className="card">
                        <button
                            className="btn shadow-lg block mx-auto mb-8 w-48 border-0 border-red-700 text-red-700 rounded-3xl"
                            onClick={onRandomVideoClick}
                        >
                            <img
                                src="icon/icon128.png"
                                alt="Icon"
                                className="w-40 h-40"
                            />{" "}
                            <h1 className="pb-4">Shuffle</h1>
                        </button>
                        <div className="mb-2">
                            <b>Selected channel</b>
                            <br />
                            <span className="text-xs">
                                {selectedChannel
                                    ? selectedChannel.snippet.resourceId
                                          .channelId
                                    : "None"}
                                {selectedChannel &&
                                    selectedChannel.snippet.channelTitle}
                            </span>
                        </div>
                        <div>
                            <b>Selected video</b>
                            <br />
                            <span className="text-xs">
                                {selectedVideo
                                    ? selectedVideo.snippet.title
                                    : "None"}
                            </span>
                        </div>
                    </div>
                    <div className="card">
                        <div>
                            <div className="flex justify-between mb-4">
                                <div
                                    className="text-left flex flex-row gap-1 cursor-pointer"
                                    onClick={() => {
                                        setShowSubscriptionsList(
                                            !showSubscriptionsList,
                                        );
                                    }}
                                >
                                    <h1>
                                        {showSubscriptionsList ? (
                                            <>▾</>
                                        ) : (
                                            <>▸</>
                                        )}
                                    </h1>
                                    <div className="">
                                        <b className="mb-1">
                                            Subscriptions List (
                                            {subscriptions?.length})
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
                                <>
                                    {subscriptions?.length == 0 ? (
                                        <div>Subscriptions not loaded.</div>
                                    ) : (
                                        <ol>
                                            {subscriptions?.map(
                                                (
                                                    subscription: GoogleApiYouTubeSubscriptionResource,
                                                    i: number,
                                                ) => {
                                                    return (
                                                        <li
                                                            key={`subscription-${i}`}
                                                        >
                                                            {
                                                                subscription
                                                                    .snippet
                                                                    .title
                                                            }
                                                        </li>
                                                    );
                                                },
                                            )}
                                        </ol>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
