// eslint-disable-next-line import/no-extraneous-dependencies
import { test } from "@jest/globals";

import { runString } from "../index";
import * as core from "./core";

test("print", () => {
  const result = runString("print(1)", {}, { encoding: "utf8" });

  core.printOptions(result);
});
