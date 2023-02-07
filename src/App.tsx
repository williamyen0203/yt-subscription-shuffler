import "./App.css";
import { gapi } from "gapi-script";
import { useEffect, useState } from "react";

interface AppProps {}

interface AppState {}

var SCOPE = "https://www.googleapis.com/auth/youtube.readonly";

const API_KEY = "DO_NOT_COMMIT";
const CLIENT_ID = "DO_NOT_COMMIT";
const CLIENT_SECRET = "DO_NOT_COMMIT";

function App(props: AppProps, state: AppState) {
  var GoogleAuth: any;

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // fetched subscriptions
  const [subscriptionIdToNameMap, setSubscriptionIdToNameMap] = useState(
    new Map<string, string>()
  );
  const [randomSubscriptionId, setRandomSubscriptionId] = useState("");

  // fetched videos
  const [videoIdToTitleMap, setVideoIdToTitleMap] = useState(
    new Map<string, string>()
  );
  const [randomVideoId, setRandomVideoId] = useState("");

  useEffect(() => {
    gapi.load("client:auth2", initClient);
  }, []);

  const initClient = () => {
    // In practice, your app can retrieve one or more discovery documents.
    var discoveryUrl =
      "https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest";

    // Initialize the gapi.client object, which app uses to make API requests.
    // Get API key and client ID from API Console.
    // 'scope' field specifies space-delimited list of access scopes.
    gapi.client
      .init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: [discoveryUrl],
        scope: SCOPE,
        plugin_name: "yt-subscription-shuffler",
      })
      .then(() => {
        GoogleAuth = gapi.auth2.getAuthInstance();

        // Listen for sign-in state changes.
        GoogleAuth.isSignedIn.listen(setSigninStatus);

        // Handle initial sign-in state. (Determine if user is already signed in.)
        setSigninStatus();
      });
  };

  const handleAuthClick = () => {
    if (GoogleAuth.isSignedIn.get()) {
      GoogleAuth.signOut();
    } else {
      GoogleAuth.signIn();
    }
  };

  const revokeAccess = () => {
    GoogleAuth.disconnect();
  };

  const setSigninStatus = () => {
    var user = GoogleAuth.currentUser.get();
    setIsLoggedIn(user.hasGrantedScopes(SCOPE));
  };

  const callApi = async () => {
    let nextPageToken = null;

    // get all subscriptions
    do {
      const subscriptionData: any = await gapi.client.request({
        path:
          "https://www.googleapis.com/youtube/v3/subscriptions?" +
          "part=snippet" +
          "&mine=true" +
          "&maxResults=50" +
          (nextPageToken == null ? "" : "&pageToken=" + nextPageToken),
      });

      nextPageToken = subscriptionData.result.nextPageToken;
      subscriptionData.result.items.forEach((item: any) => {
        setSubscriptionIdToNameMap(
          new Map(
            subscriptionIdToNameMap.set(
              item.snippet.resourceId.channelId,
              item.snippet.title
            )
          )
        );
      });
    } while (nextPageToken != null);

    // pick random channel
    const subscriptionIdsAsArray = Array.from(subscriptionIdToNameMap.keys());
    const randomSubscriptionId =
      subscriptionIdsAsArray[
        Math.floor(Math.random() * subscriptionIdsAsArray.length)
      ];
    // setting state is asynchronous and may not be set by the time it's needed
    setRandomSubscriptionId(randomSubscriptionId);

    // get videos from channel
    do {
      const searchData: any = await gapi.client.request({
        path:
          "https://www.googleapis.com/youtube/v3/search?" +
          "part=id,snippet" +
          "&maxResults=50" +
          "&order=date" +
          "&type=video" +
          "&channelId=" +
          randomSubscriptionId +
          (nextPageToken == null ? "" : "&pageToken=" + nextPageToken),
      });

      nextPageToken = searchData.result.nextPageToken;
      searchData.result.items.forEach((item: any) => {
        setVideoIdToTitleMap(
          new Map(videoIdToTitleMap.set(item.id.videoId, item.snippet.title))
        );
      });
    } while (nextPageToken != null);

    // pick random video
    const videoIdsAsArray = Array.from(videoIdToTitleMap.keys());
    const randomVideoId =
      videoIdsAsArray[Math.floor(Math.random() * videoIdsAsArray.length)];
    setRandomVideoId(randomVideoId);
  };

  return (
    <>
      <h1>Youtube Subscription Shuffler</h1>

      {!isLoggedIn && (
        <button id="sign-in-or-out-button" onClick={handleAuthClick}>
          Sign In/Authorize
        </button>
      )}
      {isLoggedIn && (
        <button id="revoke-access-button" onClick={revokeAccess}>
          Revoke access
        </button>
      )}

      {isLoggedIn && (
        <button id="call-api" onClick={callApi}>
          Call API
        </button>
      )}

      <div id="auth-status">
        {isLoggedIn
          ? "You are currently signed in and have granted access to this app."
          : "You have not authorized this app or you are signed out."}
      </div>

      <h2>
        Picking random video from {subscriptionIdToNameMap.size} channels:{" "}
        {subscriptionIdToNameMap.get(randomSubscriptionId)}
      </h2>
      <h2>
        Picking random video from channel with {videoIdToTitleMap.size} videos:{" "}
        {videoIdToTitleMap.get(randomVideoId)}
      </h2>

      <iframe
        id="player-iframe"
        height="600"
        width="800"
        src={"https://www.youtube.com/embed/" + randomVideoId}
      ></iframe>
    </>
  );
}

export default App;
