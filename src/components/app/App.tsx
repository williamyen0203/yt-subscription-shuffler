import React from "react";
import browser from "webextension-polyfill";
import { ScrollerComponent } from "../scroller/ScrollerComponent";
import { ShufflerComponent } from "../shuffler/ShufflerComponent";
import appStyles from "./appStyles.module.css";

export function App() {
    // Sends the `popupMounted` event
    React.useEffect(() => {
        browser.runtime.sendMessage({ popupMounted: true });
    }, []);

    // Renders the component tree
    return (
        <div className={appStyles.popupContainer}>
            <div className="mx-4 my-4">
                {/* <ShufflerComponent /> */}
                <hr />
                <ScrollerComponent />
            </div>
        </div>
    );
}
