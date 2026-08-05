# Youtube Subscription Shuffler

Play a random video from your list of subscriptions.

# How to run

```
npm install
npm run dev
```

Then load the unpacked extension:

1. Open `chrome://extensions` in Chrome
2. Toggle **Developer mode** (top-right)
3. Click **Load unpacked**
4. Select the `dist` folder
5. Pin the extension from the toolbar and click it

Note: the extension uses the OAuth Web application client ID baked into the
build (see `webpack.common.js`). If Google rejects it, create your own OAuth
client ID in the
[Google Cloud Console](https://console.cloud.google.com/apis/credentials)
(Web application type), register the redirect URI
`https://<extension-id>.chromiumapp.org/` (find it via
`chrome.identity.getRedirectURL()`), and set the `WEB_CLIENT_ID` environment
variable when building.

# Publishing to the Chrome Web Store

Users authorize the extension with **their own** Google account — the OAuth
client ID identifies the app, not your account. Each user gets their own
access token (stored in `chrome.storage.session`, per profile).

**Build the store package:**

```
WEB_CLIENT_ID=<production-client-id> npm run build:store
```

This builds the production bundle and writes a Chrome Web Store-ready package
to `dist-store/` (the manifest `key` is stripped, since the store assigns its
own extension ID).

**Then publish:**

1. Register a Google Cloud OAuth client (Web application) if you want a
   separate production client, and add
   `https://<store-extension-id>.chromiumapp.org/` as an authorized redirect
   URI (get the store extension ID from step 4, then re-run the build).
2. In the Google Cloud Console, set the OAuth consent screen to **In
   production**. The `youtube.readonly` scope is sensitive, so for more than
   ~100 users you'll need to verify the app (privacy policy URL, domain
   verification, security assessment).
3. Create a ZIP of the `dist-store/` folder's contents (the `manifest.json`
   must be at the ZIP root, not inside a subfolder).
4. Register at the [Chrome Web Store Developer Dashboard]
   (https://chrome.google.com/webstore/devconsole) (one-time $5 fee), create a
   new item, and upload the ZIP.
5. Fill in the listing: description, at least one screenshot (1280x800 or
   640x400), icons, privacy policy URL, and answer the data-safety questions
   (the extension reads your YouTube subscriptions/videos and stores the
   access token locally in your Chrome profile).
6. Submit for review. Once approved, `npm run build:store` with your
   production client ID becomes your release build; update the version in
   `dist/manifest.json` before each release.

Note: all users share the daily YouTube Data API v3 quota (default 10,000
units/day) of the Google Cloud project backing the OAuth client; a shuffle
costs a few units. Request a quota increase in Google Cloud if needed.

# Development

**Scripts**

-   `npm run dev` - run `webpack` in `watch` mode (rebuilds on save; reload the extension in `chrome://extensions` after changes)
-   `npm run build` - builds the production-ready unpacked extension
-   `npm run build:store` - builds a Chrome Web Store-ready package into `dist-store/` (set `WEB_CLIENT_ID` for a production OAuth client)
-   `npm test -u` - runs Jest + updates test snapshots
-   `npm run lint` - runs EsLint
-   `npm run prettify` - runs Prettier

Based off template from [react-typescript-web-extension-starter](https://github.com/aeksco/react-typescript-web-extension-starter)
