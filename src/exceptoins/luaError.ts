import { LuaBodyBufferEncoding, LuaBodyStringEncoding } from "../types";

// eslint-disable-next-line import/prefer-default-export
export class LuaError extends Error {
  readonly data: LuaBodyStringEncoding | LuaBodyBufferEncoding;

  constructor(data: LuaError["data"]) {
    super(`process exited with code ${data.status}`);
    this.data = data;
  }
}
