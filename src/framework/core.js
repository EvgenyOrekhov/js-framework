export default function({ state, actions, subscribers }) {
  let currentState = state;
  let shouldNotifySubscribers;
  let boundActions;

  function notifySubscribers({ actionName, value } = {}) {
    shouldNotifySubscribers = true;

    subscribers.every(subscriber => {
      subscriber({
        state: currentState,
        actions: boundActions,
        actionName,
        value
      });

      return shouldNotifySubscribers;
    });

    shouldNotifySubscribers = false;
  }

  boundActions = Object.fromEntries(
    Object.entries(actions).map(([actionName, action]) => [
      actionName,
      function boundAction(value) {
        function getNewState() {
          if (action.length === 2) {
            return action(value, currentState);
          }

          const partiallyAppliedActionOrNewState = action(currentState);

          return typeof partiallyAppliedActionOrNewState === "function"
            ? // Turns out we have a curried action here.
              // Reapplying arguments in the correct order:
              action(value)(currentState)
            : partiallyAppliedActionOrNewState;
        }

        currentState = getNewState();

        notifySubscribers({ actionName, value });
      }
    ])
  );

  notifySubscribers();

  return boundActions;
}
