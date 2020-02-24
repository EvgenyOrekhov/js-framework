import React from "react";

const accessibilities = ["easy", "moderate", "hard"];
const types = [
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
const prices = ["low", "moderate", "high"];

function App({ state, actions }) {
  const {
    activity,
    accessibility = "",
    type = "",
    participants = "",
    price = ""
  } = state;

  function handleAccessibilityChange({ target }) {
    actions.accessibility.set(target.value);
  }

  function handleTypeChange({ target }) {
    actions.type.set(target.value);
  }

  function handlePriceChange({ target }) {
    actions.price.set(target.value);
  }

  function handleParticipantsChange({ target }) {
    actions.participants.set(target.value);
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
      {activity !== undefined &&
        Object.keys(activity).length !== 0 &&
        (activity.error ? (
          <h2>{activity.error}</h2>
        ) : (
          <>
            <h2>{activity.activity}</h2>
            <table>
              <tbody>
                <tr>
                  <td>Type</td>
                  <td>{activity.type}</td>
                </tr>
                <tr>
                  <td>Accessibility</td>
                  <td>{activity.accessibility}</td>
                </tr>
                <tr>
                  <td>Price</td>
                  <td>{activity.price}</td>
                </tr>
                <tr>
                  <td>Participants</td>
                  <td>{activity.participants}</td>
                </tr>
              </tbody>
            </table>
          </>
        ))}
      <form onSubmit={handleRandomActivityFormSubmit}>
        <button>Get Random Activity</button>
      </form>
      <form onSubmit={handleActivityFormSubmit}>
        <select value={type} onChange={handleTypeChange}>
          <option value={""}>any</option>
          {types.map(value => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <select value={accessibility} onChange={handleAccessibilityChange}>
          <option value={""}>any</option>
          {accessibilities.map(value => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <select value={price} onChange={handlePriceChange}>
          <option value={""}>any</option>
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
