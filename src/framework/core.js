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
    Object.entries(actions).map(([actionName, action]) => {
      const curriedAction = curry(action);

      return [
        actionName,
        function boundAction(value) {
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
      ];
    })
  );

  notifySubscribers();

  return boundActions;
}
