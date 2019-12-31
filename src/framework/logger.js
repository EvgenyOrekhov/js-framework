import { diff } from "deep-object-diff";

export default function makeLogger() {
  let previousState;

  return (state, { actionName, value }) => {
    console.groupCollapsed(
      `%caction %c${actionName}`,
      "color: gray; font-weight: lighter;",
      "color: inherit; font-weight: bold;"
    );
    console.log(
      "%cprev state",
      "color: #9E9E9E; font-weight: bold;",
      previousState
    );
    console.log("%caction", "color: #03A9F4; font-weight: bold;", value);
    console.log("%cnext state", "color: #4CAF50; font-weight: bold;", state);
    console.log(
      "%cdiff",
      "color: #E8A400; font-weight: bold;",
      diff(previousState, state)
    );
    console.groupEnd();

    previousState = state;
  };
}
