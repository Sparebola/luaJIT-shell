import { execSync, spawnSync } from "child_process";

export interface LuaOptions {
  scriptPath: string;
  luaPath: string;
  luaOptions: string[];
  args: string[];
}

const insertInterpretator = (path: string, luaPath?: LuaOptions["luaPath"]) => {
  const inter = luaPath ?? "luajit";
  return `${inter} ${path}`;
};

export const run = (scriptPath: string, options?: LuaOptions) => {
  // console.log(scriptPath, options);
  console.log(insertInterpretator(scriptPath, options?.luaPath));

  // const result = spawnSync(insertInterpretator(scriptPath, options?.luaPath));
  const result = spawnSync("lua", {
    // env: process.env,
    // env: {
    //   PATH: process.env.PATH,
    // },
    // stdio: "pipe",
    // shell: true,
    // serialization: "advanced",
    encoding: "utf8",
  });

  return result;
};

export const runAsync = (scriptPath: string, options?: LuaOptions) => {
  console.log(scriptPath, options);
  return new Promise(() => {});
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
