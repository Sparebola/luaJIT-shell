# LuaJIT-shell

Running Lua | LuaJIT scripts from Node.js | Bun via stdio. With support for synchronous, asynchronous and with event subscription

# Requirements

You must have the lua interpreter or luaJIT installed and added to the `PATH`. To check, write lua or luaajit in cmd. Alternatively, you can specify a foreign interpreter or path to it in [options.luaPath](#luaoptions)

# Installation

```bash
npm i luajit-shell
```

# Usage

```javascript
import LJShell from "luajit-shell";
import {
  run,
  runAsync,
  runString,
  runAsyncString,
  createLua,
} from "luajit-shell";
```

```javascript
const LJShell = require("luajit-shell");
const {
  run,
  runAsync,
  runString,
  runAsyncString,
  createLua,
} = require("luajit-shell");
```

Run the script in synchronous mode:

```javascript
const result = run({ scriptPath: "lua/print.lua" }, { encoding: "utf8" });
```

###### result: [LuaBodyStringEncoding](#luabody)

Asynchronous promis:

```javascript
const result = await runAsync({ scriptPath: "lua/print.lua" });
```

```javascript
runAsync({ scriptPath: "lua/print.lua" }, { timeout: 1000 })
  .then((value) => console.log("result", value))
  .catch((error) => console.log("error", error));
```

###### result: [LuaBodyBufferEncoding](#luabody), because there is no coding

# API

### `run(options, childOptions)`

- `options`: [LuaOptions](#luaoptions)
- `childOptions`: [child sync options](https://nodejs.org/api/child_process.html#child_processspawnsynccommand-args-options). Supports encoding.

```javascript
const result = run({ scriptPath: "lua/print.lua" });

const result = run(
  { luaOptions: ["-e a=1", "-e print(a)"], args: ["value"], luaPath: "lua" },
  { encoding: "utf8", input: "end", timeout: 3000 }
);
```

### `runAsync(options, childOptions)`

Same as [run](#run), except it returns `Promise`

- `options`: [LuaOptions](#luaoptions)
- `childOptions`: [child async options](https://nodejs.org/api/child_process.html#child_processspawncommand-args-options). Supports encoding.

```javascript
const result = runAsync(
  {
    scriptPath: "lua/timeout.lua",
    // stdout to JSON parsing
    parser: (str: string) => {
      if (str === "") return [];

      // sub \r\n
      const json = str.substring(-4);
      return JSON.parse(json);
    },
  },
  { encoding: "utf8" }
);
```

### `runString(string, options, childOptions)`

Runs the entered line of code

- `string`: lua code
- `options`: [LuaOptions](#luaoptions) without `luaOptions`
- `childOptions`: [child sync options](https://nodejs.org/api/child_process.html#child_processspawnsynccommand-args-options). Supports encoding.

```javascript
const result = runString("print(1)", {}, { encoding: "utf8" });
```

### `runAsyncString(string, options, childOptions)`

Same as [runString](#runstring), except it returns `Promise`

- `string`: lua code
- `options`: [LuaOptions](#luaoptions) without `luaOptions`
- `childOptions`: [child async options](https://nodejs.org/api/child_process.html#child_processspawncommand-args-options). Supports encoding.

```javascript
runAsyncString("os.exit(1)")
  .then((value) => console.log("result", value))
  .catch((error) => console.log("error", error));
```

### `createLua(options, childOptions)`

Creates and returns a pure std stream

- `options`: [LuaOptions](#luaoptions) without `parser` support and mandatory `scriptPath` property
- `childOptions`: [child async options](https://nodejs.org/api/child_process.html#child_processspawncommand-args-options). Supports encoding.

**Note!** To receive messages without buffering, use `io.output():setvbuf("no")` or `io.flush()` after `print()` in the lua script.

```javascript
const lua = test.createLua({ scriptPath: "lua/threads.lua" });

lua.stdout.on("data", (data: Buffer) => {
  console.log(`stdout: ${data}`);
});

lua.stderr.on("data", (data: Buffer) => {
  console.error(`stderr: ${data}`);
});

lua.on("close", (code) => {
  console.log(`child process exited with code ${code}`);
});
```

# Documentation

## LuaError

Called exception on lua error. Consists of one property:<br/>
data: [LuaBodyStringEncoding](#luabody) | [LuaBodyBufferEncoding](#luabody)

```javascript
try {
  const result = await runAsync({ scriptPath: "lua/error.lua" });
} catch (error) {
  if (error instanceof LuaError) {
    console.log(error);
  }
}
```

## LuaOptions

Argument type options:

- `scriptPath`: string | undefined. Path to the script to be run
- `luaPath`: string | undefined. Interpreter or path to it. According to the `luajit` standard
- `luaOptions`: [string[]](https://luajit.org/running.html) | undefined. Command Line Options
- `args`: string[] | undefined. Passed arguments
- `parser`: (str: string) => string[] | undefined. Function used for parsing `stdout` and `stderr`

## LuaBody

Return value type:

- `status`: number | null;
- `signal`: NodeJS.Signals | null;
- `pid`: number | undefined;
- If `encoding` is set. `LuaBodyStringEncoding`:
  - `output`: `[NodeJS.Signals | null, ...string[]]`;
  - `stdout`: string[];
  - `stderr`: string[];
- If encoding `buffer` or not set. `LuaBodyBufferEncoding`:
  - `output`: [NodeJS.Signals | null, ...Buffer[]];
  - `stdout`: Buffer;
  - `stderr`: Buffer;

# Test

You can run the tests by using before `npm run dev`, after `npm run test`.<br/>
**Note**: Tests depend on the architecture and version of interpreters

# LICENSE

The MIT License (MIT)
