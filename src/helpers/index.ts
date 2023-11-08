import { LuaOptions, Parser } from "../types";

export const getInterpretator = (luaPath: LuaOptions["luaPath"]) => {
  return luaPath ?? "luajit";
};

export const argsConcat = (options: LuaOptions) => {
  const argsArray: string[] = [];
  const { luaOptions, scriptPath, args } = options;

  if (luaOptions) argsArray.push(...luaOptions);
  if (scriptPath) argsArray.push(scriptPath);
  if (args) argsArray.push(...args);

  return argsArray;
};

export const defaultParser = (str: string) => {
  const arr = str.split("\r\n");
  arr.pop();
  return arr;
};

export const stdSyncStringParser = (std: string[], parser: Parser) => {
  const arr: string[] = [];
  std.forEach((str) => {
    return arr.push(...parser(str));
  });
  return arr;
};
