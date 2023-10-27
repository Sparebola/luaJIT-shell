// eslint-disable-next-line max-classes-per-file
import { spawn, spawnSync } from "child_process";
import { Transform, TransformCallback } from "stream";
import { EOL as newline } from "os";

export interface LuaOptions {
  scriptPath?: string;
  luaPath?: string;
  luaOptions?: string[];
  args?: string[];
}

export class LuaError extends Error {
  status: number | null;

  signal: NodeJS.Signals | null;

  pid: number | undefined;

  stdout: string[];

  stderr: string[];

  constructor(
    status: LuaError["status"],
    signal: LuaError["signal"],
    pid: LuaError["pid"],
    stdout: LuaError["stdout"],
    stderr: LuaError["stderr"]
  ) {
    super(`process exit with code: ${status}, signal: ${signal}`);

    this.status = status;
    this.signal = signal;
    this.pid = pid;
    this.stdout = stdout;
    this.stderr = stderr;
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

export const run = (options: LuaOptions) => {
  const result = spawnSync(
    getInterpretator(options.luaPath),
    argsConcat(options),
    {
      encoding: "utf8",
      ...options,
    }
  );

  return result;
};

class NewlineTransformer extends Transform {
  // NewlineTransformer: Megatron's little known once-removed cousin
  private _lastLineData: string | undefined;

  // eslint-disable-next-line no-underscore-dangle
  _transform(chunk: any, _encoding: string, callback: TransformCallback) {
    let data: string = chunk.toString();
    // eslint-disable-next-line no-underscore-dangle
    if (this._lastLineData) data = this._lastLineData + data;
    const lines = data.split(newline);
    // eslint-disable-next-line no-underscore-dangle
    this._lastLineData = lines.pop();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    lines.forEach(this.push.bind(this));
    callback();
  }

  // eslint-disable-next-line no-underscore-dangle
  _flush(done: TransformCallback) {
    // eslint-disable-next-line no-underscore-dangle
    if (this._lastLineData) this.push(this._lastLineData);
    // eslint-disable-next-line no-underscore-dangle
    this._lastLineData = undefined;
    done();
  }
}

export const runAsync = (options: LuaOptions) => {
  return new Promise<string[]>((resolve, reject) => {
    const result = spawn(
      getInterpretator(options.luaPath),
      argsConcat(options)
    );

    const out = {
      stdout: [],
      stderr: [],
    };

    // const stdout: string[] = [];
    // const stderr: string[] = [];

    // (["stdout", "stderr"] as const).forEach((key) => {
    //   result[key].on("data", (data: Buffer) => {
    //     out[key] = data.toString("utf-8");
    //   });
    // });

    const stdoutSplitter = new NewlineTransformer();
    result.stdout.pipe(stdoutSplitter).on("data", (aaa) => {
      console.log(aaa);
    });

    // result.stdout.on("data", (data: Buffer) =>
    //   stdout.push(data.toString("utf-8"))
    // );

    // result.stderr.on("data", (data: Buffer) =>
    //   stderr.push(data.toString("utf-8"))
    // );

    result.on("close", (code, signal) => {
      if (code === 0) {
        resolve(out.stdout);
      } else {
        const { pid } = result;
        reject(new LuaError(code, signal, pid, out.stdout, out.stderr));
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
// указание формата данныж. Если текст, то кодировка
