// eslint-disable-next-line import/no-extraneous-dependencies
import { test } from "@jest/globals";

import { run } from "../index";
import * as core from "./core";

test("json", () => {
  const result = run(
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

test("print", () => {
  const result = run(
    { scriptPath: "dist/lua/print.lua", args: ["da"] },
    { encoding: "utf8" }
  );

  core.print(result);
});

test("print options", () => {
  const result = run(
    { luaOptions: ["-e a=1", "-e print(a)"] },
    { encoding: "utf8" }
  );

  core.printOptions(result);
});

test("threads", () => {
  const result = run(
    { scriptPath: "dist/lua/threads.lua" },
    { encoding: "utf8" }
  );

  core.threads(result);
});

test("timeout", () => {
  const result = run({ scriptPath: "dist/lua/timeout.lua" }, { input: "end" });

  core.timeout(result);
});

test("timeout UTF8", () => {
  const result = run(
    { scriptPath: "dist/lua/timeout.lua" },
    { encoding: "utf8", input: "end" }
  );

  core.timeoutUTF8(result);
});

test("empty", () => {
  const result = run({});
  core.empty(result);
});

test("empty UTF8", () => {
  const result = run({}, { encoding: "utf8" });
  core.emptyUTF8(result);
});
