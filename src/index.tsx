import * as React from "react";
import * as ReactDOM from "react-dom";
import browser from "webextension-polyfill";
import "./css/app.css";
import { App } from "./components/app/App";

// // // //

browser.tabs.query({ active: true, currentWindow: true }).then(() => {
    ReactDOM.render(<App />, document.getElementById("root"));
});
