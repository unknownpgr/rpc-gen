import { test } from "./frontend.rpc";
test.testRpc("Hello").then((res) => {
  console.log(res.name); // Hello:World
});
