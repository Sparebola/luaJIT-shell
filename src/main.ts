// eslint-disable-next-line max-classes-per-file
import {
  spawn,
  spawnSync,
  SpawnSyncOptionsWithStringEncoding,
  SpawnSyncOptionsWithBufferEncoding,
  SpawnOptionsWithoutStdio,
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

export interface SpawnOptionsWithStringEncoding
  extends SpawnOptionsWithoutStdio {
  encoding: BufferEncoding;
}

export interface SpawnOptionsWithBufferEncoding
  extends SpawnOptionsWithoutStdio {
  encoding?: "buffer";
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

export function run(options: LuaOptions): LuaBodyBufferEncoding;
export function run(
  options: LuaOptions,
  childOptions: SpawnSyncOptionsWithStringEncoding
): LuaBodyStringEncoding;
export function run(
  options: LuaOptions,
  childOptions: SpawnSyncOptionsWithBufferEncoding
): LuaBodyBufferEncoding;
export function run(
  options: LuaOptions,
  childOptions?:
    | SpawnSyncOptionsWithStringEncoding
    | SpawnSyncOptionsWithBufferEncoding
): LuaBodyStringEncoding | LuaBodyBufferEncoding {
  const result = spawnSync(
    getInterpretator(options.luaPath),
    argsConcat(options),
    childOptions
  );

  if (!childOptions || childOptions.encoding === "buffer") {
    return result as LuaBodyBufferEncoding;
  }

  return {
    ...result,
    stderr: formatter(result.stderr as string),
    stdout: formatter(result.stdout as string),
  } as LuaBodyStringEncoding;
}

export function runAsync(options: LuaOptions): Promise<LuaBodyBufferEncoding>;
export function runAsync(
  options: LuaOptions,
  childOptions: SpawnOptionsWithStringEncoding
): Promise<LuaBodyStringEncoding>;
export function runAsync(
  options: LuaOptions,
  childOptions: SpawnOptionsWithBufferEncoding
): Promise<LuaBodyBufferEncoding>;
export function runAsync(
  options: LuaOptions,
  childOptions?: SpawnOptionsWithStringEncoding | SpawnOptionsWithBufferEncoding
): Promise<LuaBodyStringEncoding> | Promise<LuaBodyBufferEncoding> {
  const result = spawn(
    getInterpretator(options.luaPath),
    argsConcat(options),
    childOptions
  );

  const std: {
    stdout: LuaBodyStringEncoding["stdout"] | LuaBodyBufferEncoding["stdout"];
    stderr: LuaBodyStringEncoding["stderr"] | LuaBodyBufferEncoding["stderr"];
  } = {
    stdout: [],
    stderr: [],
  };

  (["stdout", "stderr"] as const).forEach((key) => {
    result[key].on("data", (data: Buffer) => {
      // const str = data.toString("utf-8");
      // const strArray = formatter(str);
      // std[key].push(...strArray);
      // std[`${key}Original`].push(str);
      // std[key].push(data);
    });
  });

  // const result = spawn(
  //   getInterpretator(options.luaPath),
  //   argsConcat(options),
  //   childOptions
  // );

  // const std: {
  //   stdout: LuaBodyStringEncoding["stdout"];
  //   stderr: LuaBodyStringEncoding["stderr"];
  //   stdoutOriginal: string[];
  //   stderrOriginal: string[];
  // } = {
  //   stdout: [],
  //   stderr: [],
  //   stdoutOriginal: [],
  //   stderrOriginal: [],
  // };

  // (["stdout", "stderr"] as const).forEach((key) => {
  //   result[key].on("data", (data: Buffer) => {
  //     const str = data.toString("utf-8");
  //     const strArray = formatter(str);
  //     std[key].push(...strArray);
  //     std[`${key}Original`].push(str);
  //   });
  // });

  // return new Promise<LuaBodyStringEncoding>((resolve, reject) => {
  //   result.on("close", (code, signal) => {
  //     const output: LuaBodyStringEncoding["output"] = [signal];

  //     // у spawn метода имеется вывод пустого output
  //     if (std.stdout.length === 0) output.push("");
  //     output.push(...std.stdoutOriginal, ...std.stderrOriginal);

  //     const out: LuaBodyStringEncoding = {
  //       status: code,
  //       signal,
  //       pid: result.pid,
  //       output,
  //       stderr: std.stderr,
  //       stdout: std.stdout,
  //     };

  //     if (code === 0) {
  //       resolve(out);
  //     } else {
  //       reject(new LuaError(out));
  //     }
  //   });
  // });
}

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
