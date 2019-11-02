export default function makeLocalStorageManager({
  key = "state",
  defaultState = {}
} = {}) {
  return {
    get() {
      try {
        return JSON.parse(localStorage[key]);
      } catch {
        return defaultState;
      }
    },

    set(state) {
      localStorage[key] = JSON.stringify(state);
    }
  };
}
