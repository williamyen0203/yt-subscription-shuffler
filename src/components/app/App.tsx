import React from "react";
import { ShufflerComponent } from "../shuffler/ShufflerComponent";
import appStyles from "./appStyles.module.css";

export function App() {
    return (
        <div className={appStyles.popupContainer}>
            <div>
                <div className="sticky top-0 shadow-md border-b border-t-0 border-l-0 border-r-0 border-gray-200 border-solid bg-white">
                    <h1 className="p-5 m-0 flex items-center">
                        <img
                            src="icon/icon128.png"
                            alt="Icon"
                            className="w-8 h-8 mr-3"
                        />
                        Youtube Subscription Shuffler
                    </h1>
                </div>
                <ShufflerComponent />
            </div>
        </div>
    );
}
