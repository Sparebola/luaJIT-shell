export interface LuaOptions {
  scriptPath: string;
  luaPath: string;
  luaOptions: string[];
  args: string[];
}

type RunType = (scriptPath: string, options?: LuaOptions) => Promise<string>;
type RunAsyncType = (scriptPath: string, options?: LuaOptions) => string;

const run: RunType = (scriptPath, options) => {
  console.log(scriptPath, options);
  return new Promise(() => {});
};

const runAsync: RunAsyncType = (scriptPath, options) => {
  console.log(scriptPath, options);
  return "";
};

const runString: RunType = (scriptPath, options) => {
  console.log(scriptPath, options);
  return new Promise(() => {});
};

const runAsyncString: RunAsyncType = (scriptPath, options) => {
  console.log(scriptPath, options);
  return "";
};

const lua = {
  run,
  runAsync,
  runString,
  runAsyncString,
};

export default lua;
