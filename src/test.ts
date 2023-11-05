import test, { LuaError } from ".";

(async () => {
  // const result = test.run({});
  // const result = test.run({ scriptPath: "dist/lua/print.lua", args: ["da"] });
  // const result = test.run({ luaOptions: ["-e a=1", "-e print(a)"] });

  // const result = test.run({ scriptPath: "dist/lua/timeout.lua" });

  // const result = test.runAsync(
  //   { scriptPath: "dist/lua/timeout.lua" },
  //   { encoding: "utf8" }
  // );
  // result
  //   .then((value) => console.log("result", value))
  //   .catch((error) => console.log("error", error));

  // const result = test.runString("print(1)");

  // try {
  //   const result3 = await test.runAsyncString("print(3)");
  //   console.log("result", result3);
  // } catch (error) {
  //   console.log("error", error);
  // }

  // const result = test.run(
  //   { scriptPath: "dist/lua/error.lua" },
  //   { encoding: "utf8" }
  // );
  // const result = test.run(
  //   { scriptPath: "dist/lua/print.lua" },
  //   { encoding: "utf8" }
  // );
  // const result = test.run({ scriptPath: "dist/lua/threads.lua" }, { encoding: "utf8" });
  // const result = test.run(
  //   {
  //     scriptPath: "dist/lua/timeout.lua",
  //     // parser: (str: string) => {
  //     //   console.log(str);
  //     //   return [str];
  //     // },
  //   },
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

  const lua = test.createLua({ scriptPath: "dist/lua/timeout.lua" });

  lua.stdin.write("console.log('Hello!');\n");

  lua.stdout.on("data", (data: string) => {
    console.log(`stdout: ${data}`);
  });

  lua.stderr.on("data", (data: string) => {
    console.error(`stderr: ${data}`);
  });

  lua.on("close", (code) => {
    console.log(`child process exited with code ${code}`);
  });
})();
