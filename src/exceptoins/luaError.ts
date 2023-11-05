import { LuaBodyBufferEncoding, LuaBodyStringEncoding } from "../types";

export default class LuaError extends Error {
  readonly data: LuaBodyStringEncoding | LuaBodyBufferEncoding;

  constructor(data: LuaError["data"]) {
    super(`process exited with code ${data.status}`);
    this.data = data;
  }
}
