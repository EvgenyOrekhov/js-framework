import { curry } from "ramda";

export default function({ state, actions, sideEffects }) {
  let currentState = state;
  let boundActions;

  function executeSideEffects({ actionName, value } = {}) {
    sideEffects.forEach(sideEffect =>
      sideEffect(currentState, { actions: boundActions, actionName, value })
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

        executeSideEffects({ actionName, value });
      }
    ])
  );

  executeSideEffects();

  return boundActions;
}
