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

    const [isLoggedIn, setIsLoggedIn] = useState(false);

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

    const onFetchSubscriptionsClick = () => {
        gapiClient
            .fetchSubscriptions(token)
            .then((subscriptions) => {
                setSubscriptions(subscriptions);
            })
            .catch((error) => {
                setError(error.message);
            });
    };

    const callApi = async () => {
        // let nextPageToken = null;
        // // get all subscriptions
        // do {
        //     const subscriptionData: any = await gapi.client.request({
        //         path:
        //             "https://www.googleapis.com/youtube/v3/subscriptions?" +
        //             "part=snippet" +
        //             "&mine=true" +
        //             "&maxResults=50" +
        //             (nextPageToken == null
        //                 ? ""
        //                 : "&pageToken=" + nextPageToken),
        //     });
        //     nextPageToken = subscriptionData.result.nextPageToken;
        //     subscriptionData.result.items.forEach((item: any) => {
        //         setSubscriptionIdToNameMap(
        //             new Map(
        //                 subscriptionIdToNameMap.set(
        //                     item.snippet.resourceId.channelId,
        //                     item.snippet.title,
        //                 ),
        //             ),
        //         );
        //     });
        // } while (nextPageToken != null);
        // // pick random channel
        // const subscriptionIdsAsArray = Array.from(
        //     subscriptionIdToNameMap.keys(),
        // );
        // const randomSubscriptionId =
        //     subscriptionIdsAsArray[
        //         Math.floor(Math.random() * subscriptionIdsAsArray.length)
        //     ];
        // // setting state is asynchronous and may not be set by the time it's needed
        // setRandomSubscriptionId(randomSubscriptionId);
        // // get videos from channel
        // do {
        //     const searchData: any = await gapi.client.request({
        //         path:
        //             "https://www.googleapis.com/youtube/v3/search?" +
        //             "part=id,snippet" +
        //             "&maxResults=50" +
        //             "&order=date" +
        //             "&type=video" +
        //             "&channelId=" +
        //             randomSubscriptionId +
        //             (nextPageToken == null
        //                 ? ""
        //                 : "&pageToken=" + nextPageToken),
        //     });
        //     nextPageToken = searchData.result.nextPageToken;
        //     searchData.result.items.forEach((item: any) => {
        //         setVideoIdToTitleMap(
        //             new Map(
        //                 videoIdToTitleMap.set(
        //                     item.id.videoId,
        //                     item.snippet.title,
        //                 ),
        //             ),
        //         );
        //     });
        // } while (nextPageToken != null);
        // // pick random video
        // const videoIdsAsArray = Array.from(videoIdToTitleMap.keys());
        // const randomVideoId =
        //     videoIdsAsArray[Math.floor(Math.random() * videoIdsAsArray.length)];
        // setRandomVideoId(randomVideoId);
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
