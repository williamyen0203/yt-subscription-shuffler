import * as React from "react";
import { App } from "../App";
import renderer from "react-test-renderer";

it("component renders", () => {
    const tree = renderer.create(<App />).toJSON();
    expect(tree).toMatchSnapshot();
});
