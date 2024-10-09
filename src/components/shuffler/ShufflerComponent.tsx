import React from "react";
import shufflerStyles from "./shufflerStyles.module.css";
import { useEffect, useState } from "react";
import { GoogleApiClient } from "../googleapi/GoogleApiClient";

export function ShufflerComponent() {
    const [error, setError] = useState<string>();
    const [user, setUser] = useState<string>();
    const [token, setToken] = useState<string>("");
    const [subscriptions, setSubscriptions] = useState<
        GoogleApiYouTubeSubscriptionResource[]
    >([]);
    const [selectedChannelId, setSelectedChannelId] = useState<string>();

    // fetched subscriptions
    const [subscriptionIdToNameMap, setSubscriptionIdToNameMap] = useState(
        new Map<string, string>(),
    );
    const [randomSubscriptionId, setRandomSubscriptionId] = useState("");

    // fetched videos
    const [videoIdToTitleMap, setVideoIdToTitleMap] = useState(
        new Map<string, string>(),
    );
    const [randomVideoId, setRandomVideoId] = useState("");

    const gapiClient = new GoogleApiClient();

    useEffect(() => {}, []);

    const onAuthClick = async () => {
        gapiClient
            .authenticate()
            .then((token) => {
                setToken(token);
            })
            .catch((error) => {
                setError(error.message);
            });
        gapiClient
            .getSignedInUserEmail()
            .then((email) => {
                setUser(email);
            })
            .catch((error) => {
                setError(error.message);
            });
    };

    const onSignOutClick = () => {
        gapiClient
            .signOut(token)
            .then(() => {
                setUser(undefined);
            })
            .catch((error) => {
                setError(error.message);
            });
    };

    const onFetchSubscriptionsClick = async () => {
        let nextPageToken = null;
        do {
            const response = await gapiClient.fetchSubscriptions(
                token,
                nextPageToken,
            );
            setSubscriptions((prevSubscriptions) =>
                prevSubscriptions.concat(response.subscriptions),
            );
            nextPageToken = response.nextPageToken;
        } while (nextPageToken != null);
    };

    const onRandomVideoClick = () => {
        const randomSubscription =
            subscriptions[Math.floor(Math.random() * subscriptions.length)];

        const randomChannelId = randomSubscription.snippet.resourceId.channelId;
        setSelectedChannelId(randomChannelId);

        // TODO: Put in do/while
        gapiClient
            .fetchVideos(token, randomChannelId!)
            .then((searchResults) => {
                const randomVideoId =
                    searchResults.searchResults[
                        Math.floor(Math.random() * subscriptions.length)
                    ].id.videoId;
                const videoUrl = `https://www.youtube.com/watch?v=${randomVideoId}`;
                redirectToUrl(videoUrl);
            })
            .catch((error) => {
                setError(error.message);
            });
    };

    const redirectToUrl = (url: string) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const activeTab = tabs[0].id;
            chrome.tabs.update(activeTab!, { url: url });
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
                        selected: {selectedChannelId}
                        {subscriptions.map(
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

            {/* <div className={shufflerStyles.authStatus}>
                {isLoggedIn
                    ? "You are currently signed in and have granted access to this app."
                    : "You have not authorized this app or you are signed out."}
            </div>

            <h2>
                Picking random video from {subscriptionIdToNameMap.size}{" "}
                channels: {subscriptionIdToNameMap.get(randomSubscriptionId)}
            </h2>
            <h2>
                Picking random video from channel with {videoIdToTitleMap.size}{" "}
                videos: {videoIdToTitleMap.get(randomVideoId)}
            </h2>

            <iframe
                id="player-iframe"
                height="600"
                width="800"
                src={"https://www.youtube.com/embed/" + randomVideoId}
            ></iframe> */}
        </>
    );
}
