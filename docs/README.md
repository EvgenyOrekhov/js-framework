```js
import init from "./framework/core";
import { evolve, dec, multiply } from "ramda";

// init() returns actions bound to the current state, if you need them outside
// of subscribers:
const actions = init({
  // The initial state:
  state: { number: 0 },

  // Actions accept an optional value and the current state, and must return
  // a new state:
  actions: {
    // Unary action that accepts the current state (in plain JS):
    increment: (state) => ({ ...state, number: state.number + 1 }),

    // Unary action that accepts the current state (with Ramda functions):
    decrement: evolve({ number: dec }),

    // Binary action that accepts a value and the current state:
    add: (value, state) => ({ ...state, number: state.number + value }),

    // Manually curried action that accepts a value and the current state
    // (in plain JS):
    subtract: (value) => (state) => ({
      ...state,
      number: state.number - value
    }),

    // Curried action that accepts a value and the current state
    // (with Ramda functions):
    multiply: (value) => evolve({ number: multiply(value) }),

    // Nullary action that ignores the current state:
    reset: () => ({ number: 0 })
  },

  // Subscribers will be called sequentially during initialization and then
  // after any action call:
  subscribers: [
    ({ state, actions, actionName, value }) => {}
  ]
});
```
