import browser from "@src/__mocks__/webextension-polyfill";
import React from "react";
import { Tabs } from "webextension-polyfill";
import scrollerStyles from "./scrollerStyles.module.css";

// Scripts to execute in current tab
const scrollToTopPosition = 0;
const scrollToBottomPosition = 9999999;

function scrollWindow(position: number) {
    window.scroll(0, position);
}

/**
 * Executes a string of Javascript on the current tab
 * @param code The string of code to execute on the current tab
 */
function executeScript(position: number): void {
    // Query for the active tab in the current window
    browser.tabs
        .query({ active: true, currentWindow: true })
        .then((tabs: Tabs.Tab[]) => {
            // Pulls current tab from browser.tabs.query response
            const currentTab: Tabs.Tab | number = tabs[0];

            // Short circuits function execution is current tab isn't found
            if (!currentTab) {
                return;
            }
            const currentTabId: number = currentTab.id as number;

            // Executes the script in the current tab
            browser.scripting
                .executeScript({
                    target: {
                        tabId: currentTabId,
                    },
                    func: scrollWindow,
                    args: [position],
                })
                .then(() => {
                    console.log("Done Scrolling");
                });
        });
}

export function ScrollerComponent() {
    const onClickScrollTop = () => {
        executeScript(scrollToTopPosition);
    };
    const onClickScrollBottom = () => {
        executeScript(scrollToBottomPosition);
    };
    return (
        <div className="grid gap-3 grid-cols-2 mt-3 w-full">
            <button
                className={scrollerStyles.btn}
                data-testid="scroll-to-top"
                onClick={() => onClickScrollTop()}
            >
                Scroll To Top
            </button>
            <button
                className={scrollerStyles.btn}
                data-testid="scroll-to-bottom"
                onClick={() => onClickScrollBottom()}
            >
                Scroll To Bottom
            </button>
        </div>
    );
}
