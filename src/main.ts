// eslint-disable-next-line max-classes-per-file
import { spawn, spawnSync } from "child_process";

export interface LuaOptions {
  scriptPath?: string;
  luaPath?: string;
  luaOptions?: string[];
  args?: string[];
}

export interface LuaBody {
  status: number | null;
  signal: NodeJS.Signals | null;
  output: [LuaBody["signal"], ...string[]];
  pid?: number;
  stdout: string[];
  stderr: string[];
}

export class LuaError extends Error {
  readonly data: LuaBody;

  constructor(data: LuaBody) {
    const output = [...data.output];
    output.shift();
    super(output.join("\r\n"));
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

const setBody = (
  status: LuaBody["status"],
  signal: LuaBody["signal"],
  pid: LuaBody["pid"],
  output: LuaBody["output"],
  stderr: LuaBody["stderr"],
  stdout: LuaBody["stdout"]
): LuaBody => {
  return {
    status,
    signal,
    pid,
    output,
    stderr,
    stdout,
  };
};

export const run = (options: LuaOptions, childOptions) => {
  const result = spawnSync(
    getInterpretator(options.luaPath),
    argsConcat(options),
    {
      encoding: "utf8",
      ...options,
    }
  );

  const output = result.output as LuaBody["output"];

  return setBody(
    result.status,
    result.signal,
    result.pid,
    output,
    formatter(result.stderr),
    formatter(result.stdout)
  );
};

export const runAsync = (options: LuaOptions) => {
  return new Promise<LuaBody>((resolve, reject) => {
    const result = spawn(
      getInterpretator(options.luaPath),
      argsConcat(options)
    );

    const std: {
      stdout: LuaBody["stdout"];
      stderr: LuaBody["stderr"];
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
      const output: LuaBody["output"] = [signal];

      // у spawn метода имеется вывод пустого output
      if (std.stdout.length === 0) output.push("");
      output.push(...std.stdoutOriginal, ...std.stderrOriginal);

      const out: LuaBody = {
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
