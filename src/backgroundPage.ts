import browser from "webextension-polyfill";

// Listen for messages sent from other parts of the extension
browser.runtime.onMessage.addListener((request: { popupMounted: boolean }) => {
    // NOTE: this request is sent in `popup/component.tsx`
    if (request.popupMounted) {
        return;
    }
});
