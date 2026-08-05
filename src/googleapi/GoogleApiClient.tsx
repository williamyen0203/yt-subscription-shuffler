// OAuth 2.0 Web application client ID. Create it in Google Cloud Console
// (Credentials > OAuth client ID > Web application) and register the
// redirect URI https://<extension-id>.chromiumapp.org/ (use
// chrome.identity.getRedirectURL() to find the exact value).
const WEB_CLIENT_ID =
    "748985382262-goevsfnmccm8p8svmjdmsip8q0f5afb9.apps.googleusercontent.com";

const YOUTUBE_READONLY_SCOPE =
    "https://www.googleapis.com/auth/youtube.readonly";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";

export class GoogleApiClient {
    private accessToken?: string;

    getAccessToken = (): string | undefined => {
        return this.accessToken;
    };

    authenticate = (interactive: boolean): Promise<string> => {
        return new Promise((resolve, reject) => {
            const url = new URL(GOOGLE_AUTH_URL);
            url.searchParams.set("client_id", WEB_CLIENT_ID);
            url.searchParams.set(
                "redirect_uri",
                chrome.identity.getRedirectURL(),
            );
            url.searchParams.set("response_type", "token");
            url.searchParams.set("scope", YOUTUBE_READONLY_SCOPE);
            url.searchParams.set(
                "prompt",
                interactive ? "select_account" : "none",
            );

            chrome.identity.launchWebAuthFlow(
                { url: url.href, interactive },
                (responseUrl) => {
                    if (chrome.runtime.lastError) {
                        reject(new Error(chrome.runtime.lastError.message));
                        return;
                    }
                    if (!responseUrl) {
                        reject(
                            new Error("OAuth flow returned no response URL"),
                        );
                        return;
                    }

                    const params = new URLSearchParams(
                        new URL(responseUrl).hash.slice(1),
                    );
                    const token = params.get("access_token");
                    if (!token) {
                        reject(
                            new Error(
                                params.get("error_description") ??
                                    params.get("error") ??
                                    "OAuth flow returned no access token",
                            ),
                        );
                        return;
                    }

                    this.accessToken = token;
                    resolve(token);
                },
            );
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

    signOut = (): void => {
        this.accessToken = undefined;
    };

    private requireAccessToken = (): string => {
        if (!this.accessToken) {
            throw new Error("Not logged in");
        }
        return this.accessToken;
    };

    fetchSubscriptions = async (
        pageToken?: string | null,
    ): Promise<
        GoogleApiYouTubePaginationInfo<GoogleApiYouTubeSubscriptionResource>
    > => {
        const token = this.requireAccessToken();
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
        }).then(async (response) => {
            if (!response.ok) {
                const respText = await response.text();
                console.error("sub resp " + respText);
                throw new Error(
                    `Error calling youtube/v3/subscriptions API: ${response.status} response`,
                );
            }
            return response.json();
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
        const token = this.requireAccessToken();
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
