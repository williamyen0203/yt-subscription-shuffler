declare module "*.module.css";

declare namespace chrome.storage {
    const session: StorageArea;
}

declare namespace chrome.identity {
    interface WebAuthFlowOptions {
        abortOnLoadForNonInteractive?: boolean;
        timeoutMsForNonInteractive?: number;
    }
}
