import * as React from "react";
import { ShufflerComponent } from "../ShufflerComponent";
import { ComponentMeta } from "@storybook/react";

// // // //

export default {
    title: "Components/Hello",
    component: ShufflerComponent,
} as ComponentMeta<typeof ShufflerComponent>;

export const Render = () => <ShufflerComponent />;
