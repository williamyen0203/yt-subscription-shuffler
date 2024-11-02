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
            .then((response) => {
                if (!response.ok) {
                    console.log("sub resp " + response.statusText);
                    console.log("sub resp " + response.text);
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

    fetchVideos = async (
        channelId: string,
        pageToken?: string | null,
    ): Promise<
        GoogleApiYouTubePaginationInfo<GoogleApiYouTubeSearchResource>
    > => {
        const token = await this.authenticate();
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
            .then(async (response) => {
                if (!response.ok) {
                    const respText = await response.text();
                    console.log("error: " + respText);
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
                    console.log(
                        "API youtube/v3/search response: " +
                            JSON.stringify(data),
                    );
                    return data;
                },
            )
            .catch((error) => {
                throw error;
            });
    };
}
