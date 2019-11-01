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
        const newState = action(currentState, value);

        currentState = newState;

        executeSideEffects({ actionName, value });
      }
    ])
  );

  executeSideEffects();

  return boundActions;
}
