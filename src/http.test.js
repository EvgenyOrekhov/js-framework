import axios from "axios";
import nock from "nock";

it("makes HTTP requests", async done => {
  const scope = nock("https://example.com/foo/")
    .get("/bar")
    .reply(200, { foo: "bar" });

  await axios.get("https://example.com/foo/bar");

  scope.done();
  done();
});
