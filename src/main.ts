import { spawn, spawnSync } from "child_process";

export interface LuaOptions {
  scriptPath: string;
  luaPath: string;
  luaOptions: string[];
  args: string[];
}

const getInterpretator = (luaPath?: LuaOptions["luaPath"]) => {
  return luaPath ?? "luajit21";
};

export const run = (scriptPath: string, options?: LuaOptions) => {
  const result = spawnSync(getInterpretator(options?.luaPath), [scriptPath], {
    encoding: "utf8",
    ...options,
  });

  return result;
};

export const runAsync = (scriptPath: string, options?: LuaOptions) => {
  // console.log(scriptPath, options);
  // return new Promise(() => {});
  const result = spawn(getInterpretator(options?.luaPath), [scriptPath], {
    // encoding: "utf8",
    // ...options,
  });

  return result;
};

export const runString = (options?: LuaOptions) => {
  console.log(options);
  return "";
};

export const runAsyncString = (options?: LuaOptions) => {
  console.log(options);
  return new Promise(() => {});
};

export class Lua {}

// рассказать про параметры spawn, например timeout
