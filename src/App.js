import React from "react";
import "./App.css";

function App({ state, actions }) {
  return (
    <div>
      Counter: {state}
      <br />
      <button onClick={actions.inc}>+</button>
      <button onClick={actions.dec}>-</button>
    </div>
  );
}

export default App;
