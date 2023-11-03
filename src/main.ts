// eslint-disable-next-line max-classes-per-file
import {
  spawn,
  spawnSync,
  SpawnSyncOptionsWithStringEncoding,
  SpawnSyncOptionsWithBufferEncoding,
  SpawnOptionsWithoutStdio,
  ChildProcessWithoutNullStreams,
} from "child_process";

export type Parser = (str: string) => string[];

export interface LuaOptions {
  scriptPath?: string;
  luaPath?: string;
  luaOptions?: string[];
  args?: string[];
  parser?: Parser;
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
    super(`process exited with code ${data.status}`);
    this.data = data;
  }
}

interface StdBuffer {
  stdout: LuaBodyBufferEncoding["stdout"];
  stderr: LuaBodyBufferEncoding["stderr"];
}

interface StdString {
  stdout: LuaBodyStringEncoding["stdout"];
  stderr: LuaBodyStringEncoding["stderr"];
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

const defaultParser = (str: string) => {
  const arr = str.split("\r\n");
  arr.pop();
  return arr;
};

export function run(options: Omit<LuaOptions, "parser">): LuaBodyBufferEncoding;
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

  if (!childOptions || childOptions.encoding === "buffer") {
    return result as LuaBodyBufferEncoding;
  }

  const parser = options?.parser || defaultParser;

  return {
    ...result,
    stderr: parser(result.stderr as string),
    stdout: parser(result.stdout as string),
  } as LuaBodyStringEncoding;
}

const stdSyncStringParser = (std: string[], parser: Parser) => {
  const arr: string[] = [];
  std.forEach((str) => {
    return arr.push(...parser(str));
  });
  return arr;
};

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
    promiseAsyncHandler(result, stdBuffer, parser)
  );
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
