// eslint-disable-next-line import/no-extraneous-dependencies
import { expect, test } from "@jest/globals";

import { run } from "../index";

test("empty", () => {
  const result = run({});
  delete result.pid;

  expect(result).toEqual({
    status: 0,
    signal: null,
    output: [null, Buffer.alloc(0), Buffer.alloc(0)],
    stdout: Buffer.alloc(0),
    stderr: Buffer.alloc(0),
  });
});

test("scriptPath", () => {
  const result = run({ scriptPath: "dist/lua/print.lua", args: ["da"] });
  delete result.pid;
  const stdout = Buffer.from([
    50, 13, 10, 104, 101, 108, 108, 111, 13, 10, 116, 97, 98, 108, 101, 58, 32,
    48, 120, 48, 48, 55, 101, 55, 54, 48, 48, 13, 10, 100, 97, 13, 10, 51, 51,
    51, 13, 13, 10, 52, 52, 52, 13, 13, 10, 53, 53, 53, 13, 13, 10, 13, 10,
  ]);

  expect(result).toEqual({
    status: 0,
    signal: null,
    output: [null, stdout, Buffer.alloc(0)],
    stdout,
    stderr: Buffer.alloc(0),
  });
});
