/* eslint-disable no-param-reassign */
// eslint-disable-next-line import/no-extraneous-dependencies
import { expect } from "@jest/globals";
import { LuaBodyBufferEncoding, LuaBodyStringEncoding } from "../types";

// TODO: тесты зависят от архитектуры и интерпретатора!

export const json = (result: LuaBodyStringEncoding) => {
  delete result.pid;

  expect(result).toEqual({
    status: 0,
    signal: null,
    output: [null, "[1, 2, 3]\r\n", ""],
    stdout: [1, 2, 3],
    stderr: [],
  });
};

export const print = (result: LuaBodyStringEncoding) => {
  delete result.pid;

  expect(result).toEqual({
    status: 0,
    signal: null,
    output: [null, "2\r\nhello\r\nda\r\n333\r\r\n444\r\r\n555\r\r\n\r\n", ""],
    stdout: ["2", "hello", "da", "333\r", "444\r", "555\r", ""],
    stderr: [],
  });
};

export const printOptions = (result: LuaBodyStringEncoding) => {
  delete result.pid;

  expect(result).toEqual({
    status: 0,
    signal: null,
    output: [null, "1\r\n", ""],
    stdout: ["1"],
    stderr: [],
  });
};

export const threads = (result: LuaBodyStringEncoding) => {
  delete result.pid;

  expect(result).toEqual({
    status: 0,
    signal: null,
    output: [
      null,
      "LuaJIT 2.1.0-beta3 -- Copyright (C) 2005-2017 Mike Pall. http://luajit.org/\r\n",
      "Lua 5.1.5  Copyright (C) 1994-2012 Lua.org, PUC-Rio\r\n",
    ],
    stdout: [
      "LuaJIT 2.1.0-beta3 -- Copyright (C) 2005-2017 Mike Pall. http://luajit.org/",
    ],
    stderr: ["Lua 5.1.5  Copyright (C) 1994-2012 Lua.org, PUC-Rio"],
  });
};

export const timeout = (result: LuaBodyBufferEncoding) => {
  delete result.pid;

  expect(result).toEqual({
    status: 0,
    signal: null,
    output: [
      null,
      Buffer.from([115, 116, 97, 114, 116, 13, 10, 101, 110, 100, 13, 10]),
      Buffer.alloc(0),
    ],
    stdout: Buffer.from([
      115, 116, 97, 114, 116, 13, 10, 101, 110, 100, 13, 10,
    ]),
    stderr: Buffer.alloc(0),
  });
};

export const timeoutUTF8 = (result: LuaBodyStringEncoding) => {
  delete result.pid;

  expect(result).toEqual({
    status: 0,
    signal: null,
    output: [null, "start\r\nend\r\n", ""],
    stdout: ["start", "end"],
    stderr: [],
  });
};

export const empty = (result: LuaBodyBufferEncoding) => {
  delete result.pid;

  expect(result).toEqual({
    status: 0,
    signal: null,
    output: [null, Buffer.alloc(0), Buffer.alloc(0)],
    stdout: Buffer.alloc(0),
    stderr: Buffer.alloc(0),
  });
};

export const emptyUTF8 = (result: LuaBodyStringEncoding) => {
  delete result.pid;

  expect(result).toEqual({
    status: 0,
    signal: null,
    output: [null, "", ""],
    stdout: [],
    stderr: [],
  });
};
