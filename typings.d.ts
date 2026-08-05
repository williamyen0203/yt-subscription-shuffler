declare module "*.module.css";

// Injected at build time by webpack's DefinePlugin (see webpack.common.js).
// Set the WEB_CLIENT_ID environment variable to build with a different OAuth
// client (e.g. a production client for the Chrome Web Store build).
declare const __WEB_CLIENT_ID__: string;

declare namespace chrome.storage {
    const session: StorageArea;
}

declare namespace chrome.identity {
    interface WebAuthFlowOptions {
        abortOnLoadForNonInteractive?: boolean;
        timeoutMsForNonInteractive?: number;
    }
}
