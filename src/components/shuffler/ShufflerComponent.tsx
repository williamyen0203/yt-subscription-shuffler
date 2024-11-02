import React, { useEffect, useState } from "react";
import { GoogleApiClient } from "../googleapi/GoogleApiClient";
import useChromeStorage from "../hooks/UseChromeStorage";
import { LoginComponent } from "./LoginComponent";
import { ErrorComponent } from "./ErrorComponent";
import { ShuffleButtonComponent } from "./ShuffleButtonComponent";
import { SubscriptionListComponent } from "./SubscriptionListComponent";

export function ShufflerComponent(): JSX.Element {
    const [error, setError] = useState<string>();
    const [user, setUser] = useChromeStorage<string | undefined>(
        "loggedInUser",
        undefined,
    );
    const [token, setToken] = useChromeStorage<string | undefined>(
        "oauthToken",
        undefined,
    );
    const [subscriptions, setSubscriptions] = useChromeStorage<
        GoogleApiYouTubeSubscriptionResource[]
    >("subscriptions", []);

    const [selectedChannel, setSelectedChannel] = useChromeStorage<
        GoogleApiYouTubeSubscriptionResource | undefined
    >("selectedChannel", undefined);
    const [selectedVideo, setSelectedVideo] = useChromeStorage<
        GoogleApiYouTubeSearchResource | undefined
    >("selectedVideo", undefined);

    const [lastUpdated, setLastUpdated] = useChromeStorage<Date | undefined>(
        "lastUpdatedSubscriptionsDate",
        undefined,
    );

    const gapiClient = new GoogleApiClient();

    // Clear out errors after 5 seconds
    useEffect(() => {
        setInterval(() => {
            setError(undefined);
        }, 5000);
    }, [error]);

    const onAuthClick = async () => {
        gapiClient
            .authenticate()
            .then((token) => {
                setToken(token);
                gapiClient
                    .getSignedInUserEmail()
                    .then((email) => {
                        setUser(email);
                    })
                    .catch((error) => {
                        setError(error.message);
                    });
            })
            .catch((error) => {
                setError(error.message);
            });
    };

    const onSignOutClick = () => {
        if (token) {
            gapiClient
                .signOut(token)
                .then(() => {
                    setToken(undefined);
                    setUser(undefined);
                    setSubscriptions([]);
                    setSelectedChannel(undefined);
                    setSelectedVideo(undefined);
                    setLastUpdated(undefined);
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
                    await gapiClient.fetchSubscriptions(nextPageToken);
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
            await onFetchSubscriptionsClick();
        }

        if (!subscriptions || subscriptions.length == 0) {
            setError("No subscriptions were fetched.");
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
        const pageLimit = 1;
        let page = 0;
        do {
            page++;
            try {
                const searchResults: GoogleApiYouTubePaginationInfo<GoogleApiYouTubeSearchResource> =
                    await gapiClient.fetchVideos(
                        randomChannelId,
                        nextPageToken,
                    );

                channelVideos = [...channelVideos, ...searchResults.items];

                nextPageToken = searchResults.nextPageToken;
            } catch (error) {
                if (error instanceof Error) {
                    setError(error.message);
                    return;
                }
            }
        } while (nextPageToken != null && page < pageLimit);

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
            <ErrorComponent error={error} />

            <LoginComponent
                token={token}
                user={user}
                onSignOutClick={onSignOutClick}
                onAuthClick={onAuthClick}
            />

            {token && (
                <>
                    <div className="card">
                        <ShuffleButtonComponent
                            selectedChannel={selectedChannel}
                            selectedVideo={selectedVideo}
                            onRandomVideoClick={onRandomVideoClick}
                        />
                    </div>
                    <div className="card">
                        <SubscriptionListComponent
                            lastUpdated={lastUpdated}
                            subscriptions={subscriptions}
                            onFetchSubscriptionsClick={
                                onFetchSubscriptionsClick
                            }
                        />
                    </div>
                </>
            )}
        </div>
    );
}
