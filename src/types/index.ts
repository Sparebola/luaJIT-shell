import { SpawnOptionsWithoutStdio } from "child_process";

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

export interface StdBuffer {
  stdout: LuaBodyBufferEncoding["stdout"];
  stderr: LuaBodyBufferEncoding["stderr"];
}

export interface StdString {
  stdout: LuaBodyStringEncoding["stdout"];
  stderr: LuaBodyStringEncoding["stderr"];
}
