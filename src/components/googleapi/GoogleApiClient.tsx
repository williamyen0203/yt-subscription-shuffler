export interface FetchSubscriptionsResponse {
    subscriptions: GoogleApiYouTubeSubscriptionResource[];
    nextPageToken: string;
}

export interface FetchSearchResultsResponse {
    searchResults: GoogleApiYouTubeSearchResource[];
    nextPageToken: string;
}

export class GoogleApiClient {
    authenticate = (): Promise<string> => {
        return new Promise((resolve, reject) => {
            chrome.identity.getAuthToken({ interactive: true }, (token) => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                } else {
                    resolve(token);
                }
            });
        });
    };

    getSignedInUserEmail = (): Promise<string> => {
        return new Promise((resolve, reject) => {
            chrome.identity.getProfileUserInfo(
                (userInfo: chrome.identity.UserInfo) => {
                    if (chrome.runtime.lastError) {
                        reject(new Error(chrome.runtime.lastError.message));
                    } else {
                        resolve(userInfo.email);
                    }
                },
            );
        });
    };

    signOut = (token: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            chrome.identity.removeCachedAuthToken({ token: token }, () => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                } else {
                    resolve();
                }
            });
        });
    };

    fetchSubscriptions = async (
        token: string,
        pageToken?: string | null,
    ): Promise<FetchSubscriptionsResponse> => {
        const url =
            `https://content-youtube.googleapis.com/youtube/v3/subscriptions?` +
            `part=snippet` +
            `&mine=true` +
            `&maxResults=50` +
            `${pageToken ? `&pageToken=${pageToken}` : ""}`;

        return fetch(url, {
            method: "GET",
            headers: new Headers({
                Authorization: "Bearer " + token,
                Accept: "application/json",
            }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(
                        `Error calling youtube/v3/subscriptions API: ${response.status} response`,
                    );
                }
                return response.json();
            })
            .then(
                (
                    data: GoogleApiYouTubePaginationInfo<GoogleApiYouTubeSubscriptionResource>,
                ) => {
                    return {
                        subscriptions: data.items,
                        nextPageToken: data.nextPageToken,
                    };
                },
            )
            .catch((error) => {
                throw error;
            });
    };

    fetchVideos = async (
        token: string,
        channelId: string,
        pageToken?: string | null,
    ): Promise<FetchSearchResultsResponse> => {
        const url =
            `https://youtube.googleapis.com/youtube/v3/search?` +
            `part=snippet` +
            `&channelId=${channelId}` +
            `&type=video` +
            `&maxResults=50` +
            `${pageToken ? `&pageToken=${pageToken}` : ""}`;

        return fetch(url, {
            method: "GET",
            headers: new Headers({
                Authorization: "Bearer " + token,
                Accept: "application/json",
            }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(
                        `Error calling youtube/v3/search API: ${response.status} response`,
                    );
                }
                return response.json();
            })
            .then(
                (
                    data: GoogleApiYouTubePaginationInfo<GoogleApiYouTubeSearchResource>,
                ) => {
                    return {
                        searchResults: data.items,
                        nextPageToken: data.nextPageToken,
                    };
                },
            )
            .catch((error) => {
                throw error;
            });
    };
}
