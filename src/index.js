import React from "react";
import ReactDOM from "react-dom";
import BoredApp from "./BoredApp";
import * as serviceWorker from "./serviceWorker";
import { init } from "actus";
import makeHttpHandler from "./framework/http";
import httpAction from "./framework/http-action";
import logger from "actus-logger";
import defaultActions from "actus-default-actions";
import makeLocalStorageManager from "./framework/localStorageManager";
import { html, render } from "lit-html";
import m from "mithril";
import { renderComponent } from "@glimmerx/core";
import Component, { hbs, tracked } from "@glimmerx/component";
import { service } from "@glimmerx/service";
import { on } from "@glimmerx/modifier";

init([
  logger({ name: "Counter" }),

  defaultActions(0),

  {
    state: 0,

    subscribers: [
      function renderReact({ state, actions }) {
        ReactDOM.render(
          <>
            <h1>{state}</h1>
            <button onClick={actions.increment}>+</button>
            <button onClick={actions.decrement}>-</button>
          </>,
          document.getElementById("root")
        );
      },

      function renderLit({ state, actions }) {
        render(
          html`
            <h1>${state}</h1>
            <button @click=${actions.increment}>+</button>
            <button @click=${actions.decrement}>-</button>
          `,
          document.getElementById("lit")
        );
      },

      function renderMithril({ state, actions }) {
        m.render(document.getElementById("mithril"), [
          m("h1", state),
          m("button", { onclick: actions.increment }, "+"),
          m("button", { onclick: actions.decrement }, "-")
        ]);
      },

      (function makeGlimmerRenderer() {
        class GlimmerCounter extends Component {
          @service store;

          static template = hbs`
          <h1>{{this.store.state}}</h1>
          <button {{on "click" this.store.actions.increment}}>+</button>
          <button {{on "click" this.store.actions.decrement}}>-</button>
        `;
        }

        class StoreService {
          @tracked state;

          constructor({ state, actions }) {
            this.state = state;
            this.actions = actions;
          }
        }

        let isRendered = false;
        let store;

        return function renderGlimmer({ state, actions }) {
          if (!isRendered) {
            store = new StoreService({ state, actions });

            renderComponent(GlimmerCounter, {
              element: document.getElementById("glimmer"),
              services: { store }
            });

            isRendered = true;

            return;
          }

          store.state = state;
        };
      })()
    ]
  }
]);

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

init([
  logger({ name: "Bored App" }),

  defaultActions({
    accessibility: "",
    type: "",
    participants: "",
    price: "",
    activity: {}
  }),

  {
    state: localStorageManager.get(),

    actions: {
      $http: httpAction,

      getRandomActivity: (ignore, state) => ({
        ...state,
        $http: { receiveActivity: { url: "/activity" } }
      }),

      getActivity: (ignore, state) => {
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
      renderBoredApp,
      saveStateToLocalStorage,
      makeHttpHandler({ baseURL: "https://www.boredapi.com/api/" })
    ]
  }
]);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
