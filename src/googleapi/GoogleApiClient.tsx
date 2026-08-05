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

    getAuthTokenSilently = (): Promise<string> => {
        return new Promise((resolve, reject) => {
            chrome.identity.getAuthToken({ interactive: false }, (token) => {
                if (chrome.runtime.lastError || !token) {
                    reject(
                        chrome.runtime.lastError
                            ? new Error(chrome.runtime.lastError.message)
                            : new Error("Not signed in"),
                    );
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
        pageToken?: string | null,
    ): Promise<
        GoogleApiYouTubePaginationInfo<GoogleApiYouTubeSubscriptionResource>
    > => {
        const token = await this.authenticate();
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
            .then(async (response) => {
                if (!response.ok) {
                    const respText = await response.text();
                    console.log("sub resp " + respText);
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
                    console.log(
                        "API youtube/v3/subscriptions response: " +
                            JSON.stringify(data),
                    );
                    return data;
                },
            )
            .catch((error) => {
                throw error;
            });
    };

    fetchChannelUploadsPlaylistId = async (
        channelId: string,
    ): Promise<string | undefined> => {
        const url =
            `https://youtube.googleapis.com/youtube/v3/channels?` +
            `part=contentDetails` +
            `&id=${channelId}`;

        const data = await this.fetchJson<
            GoogleApiYouTubePaginationInfo<GoogleApiYouTubeChannelResource>
        >(url);
        return data.items[0]?.contentDetails.relatedPlaylists.uploads;
    };

    fetchPlaylistItems = async (
        playlistId: string,
        pageToken?: string | null,
    ): Promise<
        GoogleApiYouTubePaginationInfo<GoogleApiYouTubePlaylistItemResource>
    > => {
        const url =
            `https://youtube.googleapis.com/youtube/v3/playlistItems?` +
            `part=snippet` +
            `&playlistId=${playlistId}` +
            `&maxResults=50` +
            `${pageToken ? `&pageToken=${pageToken}` : ""}`;

        return this.fetchJson<
            GoogleApiYouTubePaginationInfo<GoogleApiYouTubePlaylistItemResource>
        >(url);
    };

    private async fetchJson<T>(url: string): Promise<T> {
        const token = await this.authenticate();
        const response = await fetch(url, {
            method: "GET",
            headers: new Headers({
                Authorization: "Bearer " + token,
                Accept: "application/json",
            }),
        });

        if (!response.ok) {
            throw new Error(
                `YouTube API request failed with ${response.status} response`,
            );
        }

        return response.json();
    }
}
