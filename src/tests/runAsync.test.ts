// eslint-disable-next-line import/no-extraneous-dependencies
import { test } from "@jest/globals";

import { runAsync } from "../index";
import * as core from "./core";

test("json", async () => {
  const result = await runAsync(
    {
      scriptPath: "dist/lua/json.lua",
      parser: (str: string) => {
        if (str === "") return [];

        // sub \r\n
        const json = str.substring(-4);
        return JSON.parse(json);
      },
    },
    { encoding: "utf8" }
  );

  core.json(result);
});

test("print", async () => {
  const result = await runAsync(
    { scriptPath: "dist/lua/print.lua", args: ["da"] },
    { encoding: "utf8" }
  );

  core.print(result);
});

test("print options", async () => {
  const result = await runAsync(
    { luaOptions: ["-e a=1", "-e print(a)"] },
    { encoding: "utf8" }
  );

  core.printOptions(result);
});

test("threads", async () => {
  const result = await runAsync(
    { scriptPath: "dist/lua/threads.lua" },
    { encoding: "utf8" }
  );

  core.threads(result);
});
