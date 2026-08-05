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

Note: the manifest includes a hardcoded OAuth `client_id`. If Google rejects
it, create your own OAuth client ID in the
[Google Cloud Console](https://console.cloud.google.com/apis/credentials), add
the `https://www.googleapis.com/auth/youtube.readonly` scope, and replace
`client_id` in `dist/manifest.json`.

# Development

**Scripts**

-   `npm run dev` - run `webpack` in `watch` mode (rebuilds on save; reload the extension in `chrome://extensions` after changes)
-   `npm run build` - builds the production-ready unpacked extension
-   `npm test -u` - runs Jest + updates test snapshots
-   `npm run lint` - runs EsLint
-   `npm run prettify` - runs Prettier

Based off template from [react-typescript-web-extension-starter](https://github.com/aeksco/react-typescript-web-extension-starter)
