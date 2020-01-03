import React from "react";
import ReactDOM from "react-dom";
import BoredApp from "./BoredApp";
import * as serviceWorker from "./serviceWorker";
import init from "./framework/core";
import makeLogger from "./framework/logger";
import makeLocalStorageManager from "./framework/localStorageManager";
import { html, render } from "lit-html";
import m from "mithril";

init({
  state: 0,
  actions: {
    inc: state => state + 1,
    dec: state => state - 1
  },
  subscribers: [
    makeLogger({ name: "Counter" }),

    function renderReact({ state, actions }) {
      ReactDOM.render(
        <>
          <h1>{state}</h1>
          <button onClick={actions.inc}>+</button>
          <button onClick={actions.dec}>-</button>
        </>,
        document.getElementById("root")
      );
    },

    function renderLit({ state, actions }) {
      render(
        html`
          <h1>${state}</h1>
          <button @click=${actions.inc}>+</button>
          <button @click=${actions.dec}>-</button>
        `,
        document.getElementById("lit")
      );
    },

    function rendeMithril({ state, actions }) {
      m.mount(document.getElementById("mithril"), {
        view: () => [
          m("h1", state),
          m("button", { onclick: actions.inc }, "+"),
          m("button", { onclick: actions.dec }, "-")
        ]
      });
    }
  ]
});

function renderBoredApp({ state, actions }) {
  ReactDOM.render(
    <BoredApp state={state} actions={actions} />,
    document.getElementById("bored")
  );
}

function getStorableState(state) {
  return { ...state, requests: undefined };
}

const localStorageManager = makeLocalStorageManager({ key: "bored" });

function saveStateToLocalStorage({ state }) {
  localStorageManager.set(getStorableState(state));
}

init({
  state: localStorageManager.get(),
  actions: {
    setAccessibility: (accessibility, state) => ({ ...state, accessibility }),
    setType: (type, state) => ({ ...state, type }),
    setParticipants: (participants, state) => ({ ...state, participants }),
    setPrice: (price, state) => ({ ...state, price }),
    reset: state => ({
      ...state,
      accessibility: undefined,
      type: undefined,
      participants: undefined,
      price: undefined
    }),
    getRandomActivity: state => ({
      ...state,
      requests: { receiveActivity: { url: "/" } }
    }),
    getActivity: state => {
      const { accessibility, type, participants, price } = state;
      const accessibilities = {
        easy: { min: 0, max: 0.33 },
        moderate: { min: 0.34, max: 0.66 },
        hard: { min: 0.67, max: 1 }
      };
      const prices = {
        low: { min: 0, max: 0.33 },
        moderate: { min: 0.34, max: 0.66 },
        high: { min: 0.67, max: 1 }
      };

      return {
        ...state,
        requests: {
          receiveActivity: {
            url: "/",
            params: {
              ...(accessibility
                ? {
                    minAccessibility: accessibilities[accessibility].min,
                    maxAccessibility: accessibilities[accessibility].max
                  }
                : {}),
              ...(price
                ? {
                    minPrice: prices[price].min,
                    maxPrice: prices[price].max
                  }
                : {}),
              type,
              participants
            }
          }
        }
      };
    },
    receiveActivity: ({ data }, state) => ({ ...state, activity: data })
  },
  subscribers: [
    makeLogger({ name: "Bored App" }),
    renderBoredApp,
    saveStateToLocalStorage
  ]
});

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
