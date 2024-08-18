import * as React from "react";
import { ScrollerComponent } from "../ScrollerComponent";
import renderer from "react-test-renderer";

it("component renders", () => {
    const tree = renderer.create(<ScrollerComponent />).toJSON();
    expect(tree).toMatchSnapshot();
});
