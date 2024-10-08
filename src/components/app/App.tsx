import React from "react";
import browser from "webextension-polyfill";
import { ShufflerComponent } from "../shuffler/ShufflerComponent";
import appStyles from "./appStyles.module.css";

export function App() {
    return (
        <div className={appStyles.popupContainer}>
            <div className="mx-4 my-4">
                <ShufflerComponent />
                <hr />
            </div>
        </div>
    );
}
