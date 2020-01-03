import React from "react";

const accessibilities = ["any", "easy", "moderate", "hard"];
const types = [
  "any",
  "education",
  "recreational",
  "social",
  "diy",
  "charity",
  "cooking",
  "relaxation",
  "music",
  "busywork"
];
const prices = ["any", "low", "moderate", "high"];

function App({ state, actions }) {
  const {
    accessibility = "",
    type = "",
    participants = "",
    price = ""
  } = state;

  function handleAccessibilityChange({ target }) {
    actions.setAccessibility(target.value);
  }

  function handleTypeChange({ target }) {
    actions.setType(target.value);
  }

  function handlePriceChange({ target }) {
    actions.setPrice(target.value);
  }

  function handleParticipantsChange({ target }) {
    actions.setParticipants(target.value);
  }

  function handleActivityFormSubmit(event) {
    event.preventDefault();
    actions.getActivity();
  }

  function handleRandomActivityFormSubmit(event) {
    event.preventDefault();
    actions.getRandomActivity();
  }

  return (
    <>
      <h1>Bored App</h1>
      <form onSubmit={handleRandomActivityFormSubmit}>
        <button>Get Random Activity</button>
      </form>
      <form onSubmit={handleActivityFormSubmit}>
        <select value={accessibility} onChange={handleAccessibilityChange}>
          {accessibilities.map(value => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <select value={type} onChange={handleTypeChange}>
          {types.map(value => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <select value={price} onChange={handlePriceChange}>
          {prices.map(value => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <input value={participants} onChange={handleParticipantsChange} />
        <button>Get Activity</button>
        <button type="button" onClick={actions.reset}>
          Reset
        </button>
      </form>
    </>
  );
}

export default App;
