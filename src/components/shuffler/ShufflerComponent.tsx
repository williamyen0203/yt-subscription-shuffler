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
        gapiClient
            .getSignedInUserEmail()
            .then((email) => {
                setUser(email);
            })
            .catch((error) => {
                setError(error.message);
            });
    }, [token]);

    const onSignOutClick = () => {
        if (token) {
            gapiClient
                .signOut(token)
                .then(() => {
                    setUser(undefined);
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
                const response = await gapiClient.fetchSubscriptions(
                    token,
                    nextPageToken,
                );
                subscriptions = [...subscriptions, ...response.items];
                // setSubscriptions(
                //     (prevSubscriptions: GoogleApiYouTubeSubscriptionResource[]) =>
                //         (prevSubscriptions = [
                //             ...prevSubscriptions,
                //             ...response.subscriptions,
                //         ]),
                // );
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
            console.log("iteration: " + channelVideos.length);
            try {
                const searchResults = await gapiClient.fetchVideos(
                    token,
                    randomChannelId,
                );

                channelVideos = [...channelVideos, ...searchResults.items];

                console.log(
                    "appended now: " + channelVideos.length + " videos",
                );
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
        <>
            <h1>Youtube Subscription Shuffler</h1>

            {/* TODO: Clear out error */}
            {error && (
                <>
                    <b>Error: </b> {error}
                </>
            )}

            {/* Logged in */}
            {user && (
                <>
                    <div>
                        <div>Logged in as {user}</div>
                        <button onClick={onSignOutClick}>Sign out</button>
                    </div>
                    <ol>
                        <button onClick={onFetchSubscriptionsClick}>
                            Fetch subscriptions
                        </button>
                        <button onClick={onRandomVideoClick}>
                            Random video
                        </button>
                        <div>
                            Selected channel:{" "}
                            {selectedChannel?.snippet.resourceId.channelId} -
                            {selectedChannel?.snippet.channelTitle}
                        </div>
                        <div>
                            Selected video: {selectedVideo?.snippet.title}
                        </div>
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
                </>
            )}

            {/* Not logged in */}
            {!user && (
                <>
                    <button onClick={onAuthClick}>Login</button>
                </>
            )}
        </>
    );
}
