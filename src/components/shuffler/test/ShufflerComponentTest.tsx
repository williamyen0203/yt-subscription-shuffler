import * as React from "react";
import { ShufflerComponent } from "../ShufflerComponent";
import renderer from "react-test-renderer";

it("component renders", () => {
    const tree = renderer.create(<ShufflerComponent />).toJSON();
    expect(tree).toMatchSnapshot();
});
