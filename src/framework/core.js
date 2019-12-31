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
          const partiallyAppliedActionOrNewState = curriedAction(currentState);

          const newState =
            typeof partiallyAppliedActionOrNewState === "function"
              ? // Turns out we have a binary action here.
                // Reapplying the arguments in the correct order:
                curriedAction(value)(currentState)
              : partiallyAppliedActionOrNewState;

          currentState = newState;

          notifySubscribers({ actionName, value });
        }
      ];
    })
  );

  notifySubscribers();

  return boundActions;
}
