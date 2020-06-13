import nock from "nock";

import makeHttpHandler from "./http";
import httpAction from "./http-action";
import { init } from "actus/commonjs";
import axios from "axios";
import axiosHttpAdapter from "axios/lib/adapters/http";

axios.defaults.adapter = axiosHttpAdapter;

it("makes HTTP requests", (done) => {
  const handleHttp = makeHttpHandler();

  const $http = jest.fn((value, state) => ({}));

  const scope = nock("https://example.com/foo/")
    .get("/bar")
    .reply(200, { foo: "bar" });

  init({
    state: {
      $http: {
        receiveResponse: {
          url: "/bar",
          method: "get",
          baseURL: "https://example.com/foo/",
        },
      },
    },
    actions: {
      $http,
      receiveResponse(response, ignore) {
        expect(response.status).toBe(200);
        expect(response.data).toEqual({ foo: "bar" });

        expect($http.mock.calls[0][0]).toEqual({
          receiveResponse: {
            url: "/bar",
            method: "get",
            baseURL: "https://example.com/foo/",
          },
        });

        scope.done();
        done();

        return {};
      },
    },
    subscribers: [handleHttp],
  });
});

it("is configurable", (done) => {
  const handleHttp = makeHttpHandler({ baseURL: "https://example.com/foo/" });

  const scope = nock("https://example.com/foo/")
    .get("/bar")
    .reply(200, { foo: "bar" });

  init({
    state: {
      $http: {
        receiveResponse: {
          url: "/bar",
          method: "get",
        },
      },
    },
    actions: {
      $http: httpAction,
      receiveResponse(response, ignore) {
        expect(response.status).toBe(200);
        expect(response.data).toEqual({ foo: "bar" });

        scope.done();
        done();

        return {};
      },
    },
    subscribers: [handleHttp],
  });
});

it("ignores undefined", (done) => {
  const handleHttp = makeHttpHandler({ baseURL: "https://example.com/foo/" });

  const scope = nock("https://example.com/foo/")
    .get("/bar")
    .reply(200, { foo: "bar" });

  init({
    state: {
      $http: {
        receiveResponse: {
          url: "/bar",
          method: "get",
        },
        shouldIgnore: undefined,
      },
    },
    actions: {
      $http: httpAction,
      receiveResponse(response, ignore) {
        expect(response.status).toBe(200);
        expect(response.data).toEqual({ foo: "bar" });

        scope.done();
        done();

        return {};
      },
    },
    subscribers: [handleHttp],
  });
});

it("does not repeat requests", (done) => {
  const handleHttp = makeHttpHandler();

  const scope = nock("https://example.com/foo/")
    .get("/bar")
    .reply(200, { foo: "bar" });

  const { trigger } = init({
    state: {
      $http: {
        receiveResponse: {
          url: "/bar",
          method: "get",
          baseURL: "https://example.com/foo/",
        },
      },
    },
    actions: {
      $http: httpAction,
      trigger: (igore, state) => state,
      receiveResponse() {
        scope.done();
        done();

        return {};
      },
    },
    subscribers: [handleHttp],
  });

  trigger();
});

it("clears internal state after request finished", (done) => {
  const handleHttp = makeHttpHandler();

  const scope = nock("https://example.com/foo/")
    .get("/bar")
    .times(2)
    .reply(200, { foo: "bar" });

  init({
    state: {
      count: 0,
      $http: {
        receiveResponse: {
          url: "/bar",
          method: "get",
          baseURL: "https://example.com/foo/",
        },
      },
    },
    actions: {
      $http: httpAction,
      receiveResponse(ignore, state) {
        if (state.count === 1) {
          scope.done();
          done();

          return {};
        }

        return {
          count: state.count + 1,
          $http: {
            receiveResponse: {
              url: "/bar",
              method: "get",
              baseURL: "https://example.com/foo/",
            },
          },
        };
      },
    },
    subscribers: [handleHttp],
  });
});

it("recognizes different requests with the same name", (done) => {
  const handleHttp = makeHttpHandler();

  const scope = nock("https://example.com/foo/")
    .get("/bar")
    .delay(1000)
    .reply(200, { foo: "bar" })
    .get("/baz")
    .reply(200, { foo: "baz" });

  const { baz } = init({
    state: {
      count: 0,
      $http: {
        receiveResponse: {
          url: "/bar",
          method: "get",
          baseURL: "https://example.com/foo/",
        },
      },
    },
    actions: {
      $http: httpAction,
      baz: (ignore, state) => ({
        count: state.count + 1,
        $http: {
          receiveResponse: {
            url: "/baz",
            method: "get",
            baseURL: "https://example.com/foo/",
          },
        },
      }),
      receiveResponse(ignore, state) {
        if (state.count === 1) {
          scope.done();
          done();

          return {};
        }

        return {};
      },
    },
    subscribers: [handleHttp],
  });

  baz();
});
