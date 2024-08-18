import * as React from "react";
import { App } from "../App";
import { ComponentMeta } from "@storybook/react";

// // // //

export default {
    title: "App",
    component: App,
} as ComponentMeta<typeof App>;

export const Render = () => <App />;
