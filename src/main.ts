// eslint-disable-next-line max-classes-per-file
import {
  spawn,
  spawnSync,
  SpawnSyncOptionsWithStringEncoding,
  SpawnSyncOptionsWithBufferEncoding,
  SpawnSyncOptions,
  SpawnSyncReturns,
} from "child_process";

export interface LuaOptions {
  scriptPath?: string;
  luaPath?: string;
  luaOptions?: string[];
  args?: string[];
}

export interface LuaBody {
  status: number | null;
  signal: NodeJS.Signals | null;
  pid?: number;
}

export interface LuaBodyStringEncoding extends LuaBody {
  output: [LuaBody["signal"], ...string[]];
  stdout: string[];
  stderr: string[];
}

export interface LuaBodyBufferEncoding extends LuaBody {
  output: [LuaBody["signal"], ...Buffer[]];
  stdout: Buffer;
  stderr: Buffer;
}

export class LuaError extends Error {
  readonly data: LuaBodyStringEncoding | LuaBodyBufferEncoding;

  constructor(data: LuaError["data"]) {
    // если установлена кодировка
    if (Array.isArray(data.stdout)) {
      const output = [...data.output];
      output.shift();
      super(output.join("\r\n"));
    } else {
      super(`process exited with code ${data.status}`);
    }
    this.data = data;
  }
}

type Run = {
  (options: LuaOptions, childOptions?: SpawnSyncOptions): LuaBodyStringEncoding;
  (
    options: LuaOptions,
    childOptions: SpawnSyncOptionsWithStringEncoding
  ): LuaBodyStringEncoding;
  (
    options: LuaOptions,
    childOptions: SpawnSyncOptionsWithBufferEncoding
  ): LuaBodyBufferEncoding;
};

const getInterpretator = (luaPath: LuaOptions["luaPath"]) => {
  // FIXME: luajit
  return luaPath ?? "luajit21";
};

const argsConcat = (options: LuaOptions) => {
  const argsArray: string[] = [];
  const { luaOptions, scriptPath, args } = options;

  if (luaOptions) argsArray.push(...luaOptions);
  if (scriptPath) argsArray.push(scriptPath);
  if (args) argsArray.push(...args);

  return argsArray;
};

const formatter = (str: string) => {
  const arr = str.split("\r\n");
  arr.pop();
  return arr;
};

const setBody = (
  status: LuaBodyStringEncoding["status"],
  signal: LuaBodyStringEncoding["signal"],
  pid: LuaBodyStringEncoding["pid"],
  output: LuaBodyStringEncoding["output"],
  stderr: LuaBodyStringEncoding["stderr"],
  stdout: LuaBodyStringEncoding["stdout"]
): LuaBodyStringEncoding => {
  return {
    status,
    signal,
    pid,
    output,
    stderr,
    stdout,
  };
};

// export interface LuaChildOptions {}

export const run = (
  options: LuaOptions,
  childOptions?:
    | SpawnSyncOptionsWithStringEncoding
    | SpawnSyncOptionsWithBufferEncoding
) => {
  // const childOptions = {..._childOptions}
  // if (childOptions.aa)

  let result: SpawnSyncReturns<Buffer> | SpawnSyncReturns<string>;
  const resultt = spawnSync(
    getInterpretator(options.luaPath),
    argsConcat(options),
    {
      ...childOptions,
      encoding: childOptions?.encoding ?? "utf-8",
    }
  );

  if (childOptions) {
    if (childOptions.encoding !== "buffer") {
      result = resultt as SpawnSyncReturns<string>;
      return {
        status: result.status,
        signal: result.signal,
        pid: result.pid,
        output: result.output as LuaBodyStringEncoding["output"],
        stderr: formatter(result.stderr),
        stdout: formatter(result.stdout),
      } as LuaBodyStringEncoding;
    }
  }

  result = resultt as SpawnSyncReturns<Buffer>;
  return {
    status: result.status,
    signal: result.signal,
    pid: result.pid,
    output: result.output as LuaBodyBufferEncoding["output"],
    stderr: result.stderr,
    stdout: result.stdout,
  } as LuaBodyBufferEncoding;

  // [NodeJS.Signals | null, ...string[]] & [NodeJS.Signals | null, ...Buffer[]]
  // let output;
  // if (childOptions.encoding === "buffer") {
  //   output = result.output as [NodeJS.Signals | null, ...string[]];
  // } else {
  //   output = result.output as [NodeJS.Signals | null, ...Buffer[]];
  // }

  // return {
  //   status: result.status,
  //   signal: result.signal,
  //   pid: result.pid,
  //   output: result.output,
  //   stderr: result.stderr,
  //   stdout: result.stdout,
  // };

  // return setBody(
  //   result.status,
  //   result.signal,
  //   result.pid,
  //   output,
  //   // @ts-ignore
  //   result.stderr,
  //   // formatter(result.stderr),
  //   // @ts-ignore
  //   result.stdout
  //   // formatter(result.stdout)
  // );
};

export const runAsync = (options: LuaOptions) => {
  return new Promise<LuaBodyStringEncoding>((resolve, reject) => {
    const result = spawn(
      getInterpretator(options.luaPath),
      argsConcat(options)
    );

    const std: {
      stdout: LuaBodyStringEncoding["stdout"];
      stderr: LuaBodyStringEncoding["stderr"];
      stdoutOriginal: string[];
      stderrOriginal: string[];
    } = {
      stdout: [],
      stderr: [],
      stdoutOriginal: [],
      stderrOriginal: [],
    };

    (["stdout", "stderr"] as const).forEach((key) => {
      result[key].on("data", (data: Buffer) => {
        const str = data.toString("utf-8");
        const strArray = formatter(str);
        std[key].push(...strArray);
        std[`${key}Original`].push(str);
      });
    });

    result.on("close", (code, signal) => {
      const output: LuaBodyStringEncoding["output"] = [signal];

      // у spawn метода имеется вывод пустого output
      if (std.stdout.length === 0) output.push("");
      output.push(...std.stdoutOriginal, ...std.stderrOriginal);

      const out: LuaBodyStringEncoding = {
        status: code,
        signal,
        pid: result.pid,
        output,
        stderr: std.stderr,
        stdout: std.stdout,
      };

      if (code === 0) {
        resolve(out);
      } else {
        reject(new LuaError(out));
      }
    });
  });
};

export const runString = (
  string: string,
  options?: Omit<LuaOptions, "luaOptions">
) => run({ ...options, luaOptions: [`-e ${string}`] });

export const runAsyncString = (
  string: string,
  options?: Omit<LuaOptions, "luaOptions">
) => runAsync({ ...options, luaOptions: [`-e ${string}`] });

export class Lua {}

// рассказать про параметры spawn, например timeout
// указание формата данныж. Если текст, то кодировка и форматтер
