import { curry } from "ramda";

export default function({ state, actions, subscribers }) {
  let currentState = state;
  let boundActions;

  function notifySubscribers({ actionName, value } = {}) {
    subscribers.forEach(subscriber =>
      subscriber(currentState, { actions: boundActions, actionName, value })
    );
  }

  boundActions = Object.fromEntries(
    Object.entries(actions).map(([actionName, action]) => [
      actionName,
      function boundAction(value) {
        const curriedAction = curry(action);

        function getNewState() {
          const newState = curriedAction(currentState);

          return typeof newState === "function"
            ? curriedAction(value)(currentState)
            : newState;
        }

        const newState = getNewState();

        currentState = newState;

        notifySubscribers({ actionName, value });
      }
    ])
  );

  notifySubscribers();

  return boundActions;
}
