import test, { LuaError } from ".";

(async () => {
  // const result = test.run(
  //   {
  //     scriptPath: "dist/lua/json.lua",
  //     parser: (str: string) => {
  //       if (str === "") return [];

  //       // sub \r\n
  //       const json = str.substring(-4);
  //       return JSON.parse(json);
  //     },
  //   },
  //   { encoding: "utf8" }
  // );

  // const result = test.run(
  //   { scriptPath: "dist/lua/print.lua", args: ["da"] },
  //   { encoding: "utf8" }
  // );

  // const result = test.run(
  //   { luaOptions: ["-e a=1", "-e print(a)"] },
  //   { encoding: "utf8" }
  // );

  // const result = test.run(
  //   { scriptPath: "dist/lua/timeout.lua" },
  //   { encoding: "utf8", input: "end" }
  // );
  // console.log(result);

  // const result = test.runAsync(
  //   { scriptPath: "dist/lua/timeout.lua" },
  //   { encoding: "utf8", timeout: 1000 }
  // );
  // result
  //   .then((value) => console.log("result", value))
  //   .catch((error) => console.log("error", error));

  // const result = test.runString("print(1)");
  // const result2 = test.runString("print(1)", {}, { encoding: "utf8" });
  // const result3 = test.runString("print(1)", {}, { encoding: "buffer" });

  try {
    // const result3 = await test.runAsyncString("print(3)");
    // const result3 = await test.runAsyncString(
    //   "print(3)",
    //   {},
    // );
    // const result3 = await test.runAsyncString(
    //   "print(3)",
    //   {},
    //   { encoding: "utf8" }
    // );
    // const result3 = await test.runAsyncString(
    //   "print(3)",
    //   {},
    //   { encoding: "buffer" }
    // );
    // console.log("result", result3);
  } catch (error) {
    console.log("error", error);
  }

  // const result = test.run(
  //   { scriptPath: "dist/lua/error.lua" },
  //   { encoding: "utf8" }
  // );
  // const result = test.run(
  //   { scriptPath: "dist/lua/print.lua" },
  //   { encoding: "utf8" }
  // );
  // const result = test.run(
  //   { scriptPath: "dist/lua/threads.lua" },
  //   { encoding: "utf8" }
  // );
  // console.log(result);

  try {
    // const result2 = await test.runAsync(
    //   { scriptPath: "dist/lua/error.lua" },
    //   { encoding: "utf8" }
    // );
    // const result2 = await test.runAsync(
    //   { scriptPath: "dist/lua/print.lua" },
    //   { encoding: "utf8" }
    // );
    // const result2 = await test.runAsync({ scriptPath: "dist/lua/threads.lua" }, { encoding: "utf8" });
    // const result2 = await test.runAsync(
    //   { scriptPath: "dist/lua/timeout.lua" },
    //   { encoding: "utf8" }
    // );
    // console.log(result2);
  } catch (error) {
    if (error instanceof LuaError) {
      console.log(error);
    }
  }

  // const lua = test.createLua({ scriptPath: "dist/lua/timeout.lua" });

  // lua.stdin.write("Hello\n");

  // lua.stdout.on("data", (data: Buffer) => {
  //   console.log(`stdout: ${data}`);
  // });

  // lua.stderr.on("data", (data: Buffer) => {
  //   console.error(`stderr: ${data}`);
  // });

  // lua.on("close", (code) => {
  //   console.log(`child process exited with code ${code}`);
  // });

  // const lua = test.createLua({ scriptPath: "dist/lua/threads.lua" });

  // lua.stdout.on("data", (data: Buffer) => {
  //   console.log(`stdout: ${data}`);
  // });

  // lua.stderr.on("data", (data: Buffer) => {
  //   console.error(`stderr: ${data}`);
  // });

  // lua.on("close", (code) => {
  //   console.log(`child process exited with code ${code}`);
  // });
})();
