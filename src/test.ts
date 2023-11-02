import test from ".";

(async () => {
  // const result = test.run({});
  // const result = test.run({ scriptPath: "dist/lua/print.lua", args: ["da"] });
  // const result = test.run({ luaOptions: ["-e a=1", "-e print(a)"] });

  // const result = test.run({ scriptPath: "dist/lua/timeout.lua" });

  // const result = test.runAsync({ scriptPath: "dist/lua/print.lua" });
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

  const result = test.run({ scriptPath: "dist/lua/error.lua" });
  const result2 = test.run(
    { scriptPath: "dist/lua/print.lua" },
    { encoding: "buffer" }
  );
  // const result = test.run({ scriptPath: "dist/lua/threads.lua" });
  // const result = test.run({ scriptPath: "dist/lua/timeout.lua" });
  console.log(result);

  try {
    const result2 = await test.runAsync({ scriptPath: "dist/lua/error.lua" });
    // const result2 = await test.runAsync({ scriptPath: "dist/lua/print.lua" });
    // const result2 = await test.runAsync({ scriptPath: "dist/lua/threads.lua" });
    // const result2 = await test.runAsync({ scriptPath: "dist/lua/timeout.lua" });
    console.log("result", result2);
  } catch (error) {
    console.log("error", error);
  }
})();
