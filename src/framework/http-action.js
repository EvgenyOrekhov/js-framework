export default function httpAction(request, state) {
  const [requestName, requestValue] = Object.entries(request)[0];

  return JSON.stringify(requestValue) ===
    JSON.stringify(state.$http[requestName])
    ? {
        ...state,
        $http: { ...state.$http, [requestName]: undefined }
      }
    : state;
}
