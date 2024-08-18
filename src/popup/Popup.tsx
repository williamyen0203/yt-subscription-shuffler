import React from "react";
// import { ShufflerComponent } from "@src/components/shuffler";
import browser from "webextension-polyfill";
import { ScrollerComponent } from "@src/components/scroller";
import css from "./styles.module.css";

export function Popup() {
    // Sends the `popupMounted` event
    React.useEffect(() => {
        browser.runtime.sendMessage({ popupMounted: true });
    }, []);

    // Renders the component tree
    return (
        <div className={css.popupContainer}>
            <div className="mx-4 my-4">
                {/* <Shuffler /> */}
                <hr />
                <ScrollerComponent />
            </div>
        </div>
    );
}
