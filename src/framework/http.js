import axios from "axios";

export default function makeHttpHandler(config) {
  const instance = axios.create(config);

  let requests = {};

  return function({ state, actions }) {
    const { $http = {} } = state;

    Object.entries($http)
      .filter(
        ([actionName, request]) =>
          request !== undefined &&
          (requests[actionName] === undefined ||
            JSON.stringify(requests[actionName]) !== JSON.stringify(request))
      )
      .forEach(([actionName, request]) => {
        instance.request(request).then(response => {
          requests = { ...requests, [actionName]: undefined };
          actions[actionName](response);
        });

        requests = { ...requests, [actionName]: request };
      });
  };
}
