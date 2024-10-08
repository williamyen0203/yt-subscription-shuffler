import React from "react";
import shufflerStyles from "./shufflerStyles.module.css";
import { useEffect, useState } from "react";

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

    useEffect(() => {}, []);

    const onAuthClick = () => {
        chrome.identity.getAuthToken({ interactive: true }, (token) => {
            if (chrome.runtime.lastError) {
                setError(chrome.runtime.lastError.message);
                return;
            }
            setToken(token);

            chrome.identity.getProfileUserInfo(
                (userInfo: chrome.identity.UserInfo) => {
                    setUser(userInfo.email);
                },
            );
        });
    };

    const onSignOutClick = () => {
        chrome.identity.removeCachedAuthToken({ token: token }, () => {
            if (chrome.runtime.lastError) {
                setError(chrome.runtime.lastError.message);
            }
        });
    };

    const onFetchSubscriptionsClick = () => {
        fetchSubscriptions(token).then((subscriptions) => {
            setSubscriptions(subscriptions);
        });
    };

    const fetchSubscriptions = (
        token: string,
        pageToken?: string,
    ): Promise<GoogleApiYouTubeSubscriptionResource[]> => {
        let url =
            "https://content-youtube.googleapis.com/youtube/v3/subscriptions?" +
            "part=snippet" +
            "&mine=true" +
            "&maxResults=50";
        if (pageToken) {
            url += "&pageToken=" + pageToken;
        }
        return fetch(url, {
            method: "GET",
            headers: new Headers({
                Authorization: "Bearer " + token,
                Accept: "application/json",
            }),
        })
            .then((response) => {
                if (!response.ok) {
                    setError("Error calling youtube/v3/subscriptions API");
                    return [];
                }
                return response.json();
            })
            .then(
                (
                    data: GoogleApiYouTubePaginationInfo<GoogleApiYouTubeSubscriptionResource>,
                ) => {
                    return data.items;
                },
            )
            .catch((error) => {
                setError(error);
                return [];
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
                            ) => {
                                return <li>{subscription.snippet.title}</li>;
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
