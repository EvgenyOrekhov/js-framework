import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import init from "./framework/core";
import makeLogger from "./framework/logger";
import { html, render } from "lit-html";

function renderReact(state, { actions }) {
  ReactDOM.render(
    <App state={state} actions={actions} />,
    document.getElementById("root")
  );
}

const litApp = ({ state, actions }) => html`
  <div>
    Counter: ${state}
    <br />
    <button @click=${actions.inc}>+</button>
    <button @click=${actions.dec}>-</button>
  </div>
`;

function renderLit(state, { actions }) {
  render(litApp({ state, actions }), document.getElementById("lit"));
}

init({
  state: 0,
  actions: {
    inc: state => state + 1,
    dec: state => state - 1
  },
  sideEffects: [renderReact, renderLit, makeLogger()]
});

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
