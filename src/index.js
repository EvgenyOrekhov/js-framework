import React from "react";
import ReactDOM from "react-dom";
import BoredApp from "./BoredApp";
import * as serviceWorker from "./serviceWorker";
import { init } from "actus";
import makeHttpHandler from "./framework/http";
import httpAction from "./framework/http-action";
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
  return { ...state, $http: undefined, activity: undefined };
}

const localStorageManager = makeLocalStorageManager({ key: "bored" });

function saveStateToLocalStorage({ state }) {
  localStorageManager.set(getStorableState(state));
}

init({
  state: localStorageManager.get(),
  actions: {
    $http: httpAction,
    setAccessibility: (accessibility, state) => ({ ...state, accessibility }),
    setType: (type, state) => ({ ...state, type }),
    setParticipants: (participants, state) => ({ ...state, participants }),
    setPrice: (price, state) => ({ ...state, price }),
    reset: state => ({
      ...state,
      accessibility: undefined,
      type: undefined,
      participants: undefined,
      price: undefined,
      activity: undefined
    }),
    getRandomActivity: state => ({
      ...state,
      $http: { receiveActivity: { url: "/activity" } }
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
        $http: {
          receiveActivity: {
            url: "/activity",
            params: {
              ...(accessibility
                ? {
                    minaccessibility: accessibilities[accessibility].min,
                    maxaccessibility: accessibilities[accessibility].max
                  }
                : {}),
              ...(price
                ? {
                    minprice: prices[price].min,
                    maxprice: prices[price].max
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
    saveStateToLocalStorage,
    makeHttpHandler({ baseURL: "https://www.boredapi.com/api/" })
  ]
});

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
