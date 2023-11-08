// eslint-disable-next-line import/no-extraneous-dependencies
import { test } from "@jest/globals";

import { runAsyncString } from "../index";
import * as core from "./core";

test("print", async () => {
  const result = await runAsyncString("print(1)", {}, { encoding: "utf8" });

  core.printOptions(result);
});
