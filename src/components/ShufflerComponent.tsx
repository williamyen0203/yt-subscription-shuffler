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
        GoogleApiYouTubePlaylistItemResource | undefined
    >("selectedVideo", undefined);

    const [lastUpdated, setLastUpdated] = useChromeStorage<number | undefined>(
        "lastUpdatedSubscriptionsDate",
        undefined,
    );

    const gapiClient = new GoogleApiClient();

    // Clear out errors after 5 seconds
    useEffect(() => {
        if (!error) {
            return;
        }

        const timeout = setTimeout(() => {
            setError(undefined);
        }, 5000);

        return () => clearTimeout(timeout);
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

    const onFetchSubscriptionsClick = async (): Promise<
        GoogleApiYouTubeSubscriptionResource[] | undefined
    > => {
        if (!token) {
            setError("Not logged in");
            return undefined;
        }

        let nextPageToken = null;
        let fetchedSubscriptions: GoogleApiYouTubeSubscriptionResource[] = [];
        do {
            try {
                const response: GoogleApiYouTubePaginationInfo<GoogleApiYouTubeSubscriptionResource> =
                    await gapiClient.fetchSubscriptions(nextPageToken);
                fetchedSubscriptions = [
                    ...fetchedSubscriptions,
                    ...response.items,
                ];
                nextPageToken = response.nextPageToken;
            } catch (e) {
                if (e instanceof Error) {
                    setError(e.message);
                    return undefined;
                }
            }
        } while (nextPageToken != null);

        setSubscriptions(fetchedSubscriptions);
        setLastUpdated(new Date().getTime());
        return fetchedSubscriptions;
    };

    const onRandomVideoClick = async () => {
        if (!token) {
            setError("Not logged in");
            return;
        }

        let currentSubscriptions = subscriptions;
        if (!currentSubscriptions || currentSubscriptions.length == 0) {
            currentSubscriptions = await onFetchSubscriptionsClick();
        }

        if (!currentSubscriptions || currentSubscriptions.length == 0) {
            setError("No subscriptions were fetched.");
            return;
        }

        // Pick a random channel
        const randomSubscription =
            currentSubscriptions[
                Math.floor(Math.random() * currentSubscriptions.length)
            ];
        setSelectedChannel(randomSubscription);
        const randomChannelId = randomSubscription.snippet.resourceId.channelId;

        try {
            // Fetch the channel's uploads playlist so every video is eligible
            const uploadsPlaylistId =
                await gapiClient.fetchChannelUploadsPlaylistId(
                    randomChannelId,
                );
            if (!uploadsPlaylistId) {
                setError("No uploads found for selected channel.");
                return;
            }

            // Pick a random page, then a random video within that page, so
            // every video in the channel has an equal chance of being picked
            const firstPage = await gapiClient.fetchPlaylistItems(
                uploadsPlaylistId,
            );
            const totalPages = Math.max(
                1,
                Math.ceil(firstPage.pageInfo.totalResults / 50),
            );
            const targetPage = Math.min(
                Math.floor(Math.random() * totalPages),
                totalPages - 1,
            );

            let channelVideos = firstPage.items;
            let nextPageToken = firstPage.nextPageToken;
            let currentPage = 0;
            while (currentPage < targetPage && nextPageToken) {
                const nextPage = await gapiClient.fetchPlaylistItems(
                    uploadsPlaylistId,
                    nextPageToken,
                );
                channelVideos = nextPage.items;
                nextPageToken = nextPage.nextPageToken;
                currentPage++;
            }

            if (channelVideos.length == 0) {
                setError("No videos found for selected channel.");
                return;
            }

            // Pick a random video from the channel
            const randomVideo =
                channelVideos[Math.floor(Math.random() * channelVideos.length)];
            setSelectedVideo(randomVideo);
            const randomVideoId = randomVideo.snippet.resourceId.videoId;
            const videoUrl = `https://www.youtube.com/watch?v=${randomVideoId}`;

            openLinkInNewTab(videoUrl);
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            }
        }
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
