import {
  spawn,
  spawnSync,
  SpawnSyncOptions,
  SpawnSyncOptionsWithStringEncoding,
  SpawnSyncOptionsWithBufferEncoding,
  SpawnOptionsWithoutStdio,
  ChildProcessWithoutNullStreams,
} from "child_process";

import { RequiredBy } from "./utility";
import {
  Parser,
  LuaOptions,
  LuaBodyStringEncoding,
  LuaBodyBufferEncoding,
  SpawnOptionsWithStringEncoding,
  SpawnOptionsWithBufferEncoding,
  StdBuffer,
  StdString,
} from "./types";
import {
  getInterpretator,
  argsConcat,
  defaultParser,
  stdSyncStringParser,
} from "./helpers";
import { LuaError } from "./exceptoins/luaError";

export function run(options: Omit<LuaOptions, "parser">): LuaBodyBufferEncoding;
export function run(
  options: Omit<LuaOptions, "parser">,
  childOptions?: Omit<SpawnSyncOptions, "encoding">
): LuaBodyBufferEncoding;
export function run(
  options: LuaOptions,
  childOptions: SpawnSyncOptionsWithStringEncoding
): LuaBodyStringEncoding;
export function run(
  options: Omit<LuaOptions, "parser">,
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

  if (
    !childOptions ||
    !childOptions.encoding ||
    childOptions.encoding === "buffer"
  ) {
    return result as LuaBodyBufferEncoding;
  }

  const parser = options?.parser || defaultParser;

  return {
    ...result,
    stderr: parser(result.stderr as string),
    stdout: parser(result.stdout as string),
  } as LuaBodyStringEncoding;
}

const promiseAsyncHandler =
  <T extends StdBuffer | StdString>(
    process: ChildProcessWithoutNullStreams,
    std: T,
    parser: Parser
  ) =>
  <K extends LuaBodyStringEncoding | LuaBodyBufferEncoding>(
    resolve: (value: K | PromiseLike<K>) => void,
    reject: (reason?: LuaError) => void
  ) => {
    process.on("close", (code, signal) => {
      const out = {
        status: code,
        signal,
        pid: process.pid,
      } as K;

      if (Buffer.isBuffer(std.stderr) && Buffer.isBuffer(std.stdout)) {
        out.output = [signal, std.stdout, std.stderr] as K["output"];
        out.stdout = std.stdout;
        out.stderr = std.stderr;
      } else if (Array.isArray(std.stderr) && Array.isArray(std.stdout)) {
        // у spawn метода имеется вывод пустого output и stderr
        if (std.stdout.length === 0) std.stdout.push("");
        if (std.stderr.length === 0) std.stderr.push("");

        out.output = [signal, ...std.stdout, ...std.stderr] as K["output"];
        out.stdout = stdSyncStringParser(std.stdout, parser);
        out.stderr = stdSyncStringParser(std.stderr, parser);
      }

      if (code === 0) {
        resolve(out);
      } else {
        reject(new LuaError(out));
      }
    });
  };

export function runAsync(
  options: Omit<LuaOptions, "parser">
): Promise<LuaBodyBufferEncoding>;
export function runAsync(
  options: LuaOptions,
  childOptions?: Omit<SpawnOptionsWithoutStdio, "encoding">
): Promise<LuaBodyBufferEncoding>;
export function runAsync(
  options: LuaOptions,
  childOptions: SpawnOptionsWithStringEncoding
): Promise<LuaBodyStringEncoding>;
export function runAsync(
  options: Omit<LuaOptions, "parser">,
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

  const stdBuffer: {
    stdout: LuaBodyBufferEncoding["stdout"];
    stderr: LuaBodyBufferEncoding["stderr"];
  } = {
    stdout: Buffer.alloc(0),
    stderr: Buffer.alloc(0),
  };

  const stdString: {
    stdout: LuaBodyStringEncoding["stdout"];
    stderr: LuaBodyStringEncoding["stderr"];
  } = {
    stdout: [],
    stderr: [],
  };

  (["stdout", "stderr"] as const).forEach((key) => {
    result[key].on("data", (data: Buffer) => {
      if (!childOptions || childOptions.encoding === "buffer") {
        stdBuffer[key] = Buffer.concat([stdBuffer[key], data]);
      } else {
        stdString[key].push(data.toString(childOptions.encoding || "utf8"));
      }
    });
  });

  const parser = options?.parser || defaultParser;

  if (!childOptions || childOptions.encoding === "buffer") {
    return new Promise<LuaBodyBufferEncoding>(
      promiseAsyncHandler(result, stdBuffer, parser)
    );
  }

  return new Promise<LuaBodyStringEncoding>(
    promiseAsyncHandler(result, stdString, parser)
  );
}

export function runString(string: string): LuaBodyBufferEncoding;
export function runString(
  string: string,
  options?: Omit<LuaOptions, "parser" | "luaOptions">
): LuaBodyBufferEncoding;
export function runString(
  string: string,
  options: Omit<LuaOptions, "parser" | "luaOptions">,
  childOptions?: Omit<SpawnSyncOptions, "encoding">
): LuaBodyBufferEncoding;
export function runString(
  string: string,
  options: Omit<LuaOptions, "luaOptions">,
  childOptions: SpawnSyncOptionsWithStringEncoding
): LuaBodyStringEncoding;
export function runString(
  string: string,
  options: Omit<LuaOptions, "parser" | "luaOptions">,
  childOptions: SpawnSyncOptionsWithBufferEncoding
): LuaBodyBufferEncoding;
export function runString(
  string: string,
  options?: Omit<LuaOptions, "luaOptions">,
  childOptions?:
    | SpawnSyncOptionsWithStringEncoding
    | SpawnSyncOptionsWithBufferEncoding
): LuaBodyStringEncoding | LuaBodyBufferEncoding {
  return run({ ...options, luaOptions: [`-e ${string}`] }, childOptions);
}

export function runAsyncString(string: string): Promise<LuaBodyBufferEncoding>;
export function runAsyncString(
  string: string,
  options?: Omit<LuaOptions, "parser" | "luaOptions">
): Promise<LuaBodyBufferEncoding>;
export function runAsyncString(
  string: string,
  options: Omit<LuaOptions, "parser" | "luaOptions">,
  childOptions?: Omit<SpawnOptionsWithoutStdio, "encoding">
): Promise<LuaBodyBufferEncoding>;
export function runAsyncString(
  string: string,
  options: Omit<LuaOptions, "luaOptions">,
  childOptions: SpawnOptionsWithStringEncoding
): Promise<LuaBodyStringEncoding>;
export function runAsyncString(
  string: string,
  options: Omit<LuaOptions, "parser" | "luaOptions">,
  childOptions: SpawnOptionsWithBufferEncoding
): Promise<LuaBodyBufferEncoding>;
export function runAsyncString(
  string: string,
  options?: Omit<LuaOptions, "luaOptions">,
  childOptions?: SpawnOptionsWithStringEncoding | SpawnOptionsWithBufferEncoding
): Promise<LuaBodyStringEncoding | LuaBodyBufferEncoding> {
  return runAsync({ ...options, luaOptions: [`-e ${string}`] }, childOptions);
}

export const createLua = (
  options: RequiredBy<Omit<LuaOptions, "parser">, "scriptPath">,
  childOptions?: SpawnOptionsWithoutStdio
) =>
  spawn(getInterpretator(options.luaPath), argsConcat(options), childOptions);
