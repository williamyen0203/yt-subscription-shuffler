import React, { useEffect } from "react";
import shufflerStyles from "./shufflerStyles.module.css";
import { useState } from "react";
import { GoogleApiClient } from "../googleapi/GoogleApiClient";
import useChromeStorage from "../hooks/UseChromeStorage";

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
                }
            }
        } while (nextPageToken != null);

        setSubscriptions(subscriptions);
    };

    const onRandomVideoClick = async () => {
        if (!token) {
            return;
            setError("Not logged in");
        }

        if (!subscriptions) {
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
        <div className="pt-4 px-2 flex flex-col gap-2">
            {/* TODO: Clear out error */}
            {error && (
                <>
                    <b>Error: </b> {error}
                </>
            )}

            <div className="card text-base flex justify-between">
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
                            className="btn mr-4"
                            onClick={onFetchSubscriptionsClick}
                        >
                            Fetch subscriptions
                        </button>
                        <button
                            className="btn"
                            onClick={onRandomVideoClick}
                            disabled={subscriptions?.length == 0}
                        >
                            Random video
                        </button>
                    </div>
                    <div className="card">
                        <div>
                            Selected channel:{" "}
                            {selectedChannel?.snippet.resourceId.channelId} -
                            {selectedChannel?.snippet.channelTitle}
                        </div>
                        <div>
                            Selected video: {selectedVideo?.snippet.title}
                        </div>
                    </div>
                    <div className="card">
                        <div className="">
                            <h1
                                className="cursor-pointer mb-4"
                                onClick={() => {
                                    setShowSubscriptionsList(
                                        !showSubscriptionsList,
                                    );
                                }}
                            >
                                {showSubscriptionsList ? <>▴</> : <>▾</>}{" "}
                                Subscriptions List ({subscriptions?.length})
                            </h1>
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
