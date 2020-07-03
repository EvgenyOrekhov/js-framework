import React from "react";
import { connect } from "./framework/actus-react";

function Subcomponent({ activity }) {
  return <pre>activity: {JSON.stringify(activity, null, 2)}</pre>;
}

const ConnectedSubcomponent = connect(({ activity }) => ({ activity }))(
  Subcomponent
);

function Example() {
  return <ConnectedSubcomponent />;
}

export default Example;
