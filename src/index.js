import React from "react";
import ReactDOM from "react-dom";
import BoredApp from "./BoredApp";
import * as serviceWorker from "./serviceWorker";
import { init } from "actus";
import makeHttpHandler from "./framework/http";
import httpAction from "./framework/http-action";
import logger from "actus-logger";
import defaultActions from "actus-default-actions";
import localStoragePlugin from "actus-localstorage";
import { html, render } from "lit-html";
import m from "mithril";
import { renderComponent } from "@glimmerx/core";
import Component, { hbs, tracked } from "@glimmerx/component";
import { service } from "@glimmerx/service";
import { on } from "@glimmerx/modifier";

function reduxDevTools({ name } = {}) {
  if (
    typeof window === "undefined" ||
    window.__REDUX_DEVTOOLS_EXTENSION__ === undefined
  ) {
    return {};
  }

  return {
    actions: {
      setStateFromDevTools: value => value
    },

    subscribers: [
      (function makeReduxDevtoolsSubscriber() {
        let initialState;
        let currentState;
        let devTools;

        function parse(value) {
          try {
            return JSON.parse(value);
          } catch (error) {
            devTools.error(`Invalid JSON: ${value}`);

            throw error;
          }
        }

        function getSlice(object, path) {
          return path.reduce(
            (acc, property) =>
              acc === undefined || acc === null ? undefined : acc[property],
            object
          );
        }

        return function send({ state, actionName, value, actions }) {
          currentState = state;

          if (devTools === undefined) {
            initialState = state;

            devTools = window.__REDUX_DEVTOOLS_EXTENSION__.connect({
              name,
              actionCreators: actions,
              actionsBlacklist: ["setStateFromDevTools"],
              features: {
                pause: true, // start/pause recording of dispatched actions
                lock: false, // lock/unlock dispatching actions and side effects
                persist: false, // persist states on page reloading
                export: false, // export history of actions in a file
                import: false, // import history of actions from a file
                jump: true, // jump back and forth (time travelling)
                skip: false, // skip (cancel) actions
                reorder: false, // drag and drop actions in the history list
                dispatch: true, // dispatch custom actions or action creators
                test: false // generate tests for the selected actions
              }
            });

            devTools.subscribe(message => {
              if (message.type === "ACTION") {
                const payload =
                  typeof message.payload === "string"
                    ? parse(message.payload)
                    : message.payload;

                if (payload.name === undefined) {
                  devTools.error(
                    `Invalid action: ${message.payload}.
                    Example: { "name": "foo.bar", "args": ["{ \\"baz\\": \\"qux\\" }"] }`
                  );

                  return;
                }

                const action = getSlice(actions, payload.name.split("."));

                if (typeof action === "function") {
                  action(
                    Array.isArray(payload.args) && payload.args.length === 0
                      ? undefined
                      : parse(payload.args[0])
                  );

                  return;
                }

                devTools.error(`Unknown action: ${payload.name}`);

                return;
              }

              if (message.type === "DISPATCH") {
                // eslint-disable-next-line default-case
                switch (message.payload.type) {
                  case "RESET":
                    actions.setStateFromDevTools(initialState);
                    devTools.init(initialState);

                    return;
                  case "COMMIT":
                    devTools.init(currentState);

                    return;
                  case "ROLLBACK":
                    const commitedState = parse(message.state);

                    actions.setStateFromDevTools(commitedState);
                    devTools.init(commitedState);

                    return;
                  case "JUMP_TO_STATE":
                  case "JUMP_TO_ACTION":
                    actions.setStateFromDevTools(parse(message.state));

                    return;
                }
              }
            });

            devTools.init(state);

            return;
          }

          const type = Array.isArray(actionName)
            ? actionName.join(".")
            : actionName;

          devTools.send({ type, payload: value }, state);
        };
      })()
    ]
  };
}

init([
  logger({ name: "Counter" }),

  defaultActions(0),

  reduxDevTools({ name: "Counter" }),

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

const initialState = {
  accessibility: "",
  type: "",
  participants: "",
  price: "",
  activity: {}
};

init([
  logger({ name: "Bored App" }),

  defaultActions(initialState),

  reduxDevTools({ name: "Bored App" }),

  {
    state: initialState,

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
      makeHttpHandler({ baseURL: "https://www.boredapi.com/api/" })
    ]
  },

  localStoragePlugin({
    key: "bored",
    selector: state => ({ ...state, $http: undefined, activity: undefined })
  })
]);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
