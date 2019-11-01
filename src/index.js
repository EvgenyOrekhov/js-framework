import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import init from "./framework/core";

function render(state, { actions }) {
  ReactDOM.render(
    <App state={state} actions={actions} />,
    document.getElementById("root")
  );
}

const log = (function makeLogger() {
  let previousState;

  return (state, { actionName, value }) => {
    console.groupCollapsed(
      `%caction %c${actionName}`,
      "color: gray; font-weight: lighter;",
      "color: inherit; font-weight: bold;"
    );
    console.log(
      "%cprev state",
      "color: #9E9E9E; font-weight: bold;",
      previousState
    );
    console.log("%caction", "color: #03A9F4; font-weight: bold;", value);
    console.log("%cnext state", "color: #4CAF50; font-weight: bold;", state);
    console.groupEnd();

    previousState = state;
  };
})();

init({
  state: 0,
  actions: {
    inc: state => state + 1,
    dec: state => state - 1
  },
  sideEffects: [render, log]
});

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
