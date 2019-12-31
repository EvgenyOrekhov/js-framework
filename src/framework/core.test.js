import init from "./core";

it("initializes", () => {
  const sideEffect1 = jest.fn();
  const sideEffect2 = jest.fn();

  init({
    state: 0,
    actions: {
      inc: state => state + 1,
      dec: state => state - 1
    },
    sideEffects: [sideEffect1, sideEffect2]
  });

  expect(sideEffect1.mock.calls.length).toBe(1);
  expect(sideEffect1.mock.calls[0][0]).toBe(0);
  expect(sideEffect2.mock.calls.length).toBe(1);
  expect(sideEffect2.mock.calls[0][0]).toBe(0);
});

it("returns bound actions", () => {
  const sideEffect1 = jest.fn();
  const sideEffect2 = jest.fn();

  const { inc, dec } = init({
    state: 0,
    actions: {
      inc: state => state + 1,
      dec: state => state - 1
    },
    sideEffects: [sideEffect1, sideEffect2]
  });

  inc();
  inc();
  inc();
  dec();

  expect(sideEffect1.mock.calls.length).toBe(5);
  expect(sideEffect1.mock.calls[4][0]).toBe(2);
  expect(sideEffect2.mock.calls.length).toBe(5);
  expect(sideEffect2.mock.calls[4][0]).toBe(2);
});

it("passes value to actions", () => {
  const sideEffect = jest.fn();

  const { add, subtract } = init({
    state: 0,
    actions: {
      add: (value, state) => state + value,
      subtract: (value, state) => state - value
    },
    sideEffects: [sideEffect]
  });

  add(4);
  subtract(8);

  expect(sideEffect.mock.calls[2][0]).toBe(-4);
});

it("allows to pass undefined to actions", () => {
  const sideEffect = jest.fn();

  const { test } = init({
    state: 0,
    actions: {
      test: (value, state) => [value, state]
    },
    sideEffects: [sideEffect]
  });

  test(undefined);

  expect(sideEffect.mock.calls[1][0]).toEqual([undefined, 0]);
});

it("works with manually curried actions", () => {
  const sideEffect = jest.fn();

  const { add, subtract } = init({
    state: 0,
    actions: {
      add: value => state => state + value,
      subtract: value => state => state - value
    },
    sideEffects: [sideEffect]
  });

  add(4);
  subtract(8);

  expect(sideEffect.mock.calls[2][0]).toBe(-4);
});

it("doesn't pass value to actions that don't accept it", () => {
  const sideEffect1 = jest.fn();

  const { inc } = init({
    state: 0,
    actions: {
      inc: state => state + 1
    },
    sideEffects: [sideEffect1]
  });

  inc("foo");

  expect(sideEffect1.mock.calls[1][0]).toBe(1);
});

it("works with unnecessarily curried actions", () => {
  const sideEffect1 = jest.fn();

  const { inc } = init({
    state: 0,
    actions: {
      inc: () => state => state + 1
    },
    sideEffects: [sideEffect1]
  });

  inc();

  expect(sideEffect1.mock.calls[1][0]).toBe(1);
});

it("passes actions to side effects", done => {
  const sideEffect1 = jest.fn((ignore, { actions }) => {
    setTimeout(actions.inc, 0);
    setTimeout(actions.inc, 0);
    setTimeout(actions.inc, 0);
  });
  const sideEffect2 = jest.fn((ignore, { actions }) => {
    setTimeout(actions.dec, 0);
    setTimeout(() => {
      expect(sideEffect1.mock.calls.length).toBe(5);
      expect(sideEffect1.mock.calls[4][0]).toBe(2);
      expect(sideEffect2.mock.calls.length).toBe(5);
      expect(sideEffect2.mock.calls[4][0]).toBe(2);
      done();
    }, 0);
  });

  init({
    state: 0,
    actions: {
      inc: state => state + 1,
      dec: state => state - 1
    },
    sideEffects: [sideEffect1, sideEffect2]
  });
});

it("passes current action name and value to side effects", () => {
  const sideEffect1 = jest.fn();
  const sideEffect2 = jest.fn();

  const { add, subtract } = init({
    state: 0,
    actions: {
      add: (value, state) => state + value,
      subtract: (value, state) => state - value
    },
    sideEffects: [sideEffect1, sideEffect2]
  });

  add(4);
  subtract(8);

  expect(sideEffect1.mock.calls[1][1].actionName).toBe("add");
  expect(sideEffect1.mock.calls[1][1].value).toBe(4);
  expect(sideEffect1.mock.calls[2][1].actionName).toBe("subtract");
  expect(sideEffect1.mock.calls[2][1].value).toBe(8);
  expect(sideEffect2.mock.calls[1][1].actionName).toBe("add");
  expect(sideEffect2.mock.calls[1][1].value).toBe(4);
  expect(sideEffect2.mock.calls[2][1].actionName).toBe("subtract");
  expect(sideEffect2.mock.calls[2][1].value).toBe(8);
});
