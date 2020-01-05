import httpAction from "./http-action";

it("removes request", () => {
  expect(
    httpAction({ foo: {} }, { $http: { foo: {}, bar: {} }, baz: "qux" })
  ).toEqual({ $http: { bar: {} }, baz: "qux" });
});

it("compares requests by value", () => {
  expect(
    httpAction(
      { foo: { bar: "baz" } },
      { $http: { foo: { bar: "qux" }, bar: {} }, baz: "qux" }
    )
  ).toEqual({ $http: { foo: { bar: "qux" }, bar: {} }, baz: "qux" });
});
