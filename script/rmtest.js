const fs = require("fs");
const path = require("path");

// удаляем test...
const testsPath = path.resolve(__dirname, "../dist/tests");
fs.rmSync(testsPath, { recursive: true, force: true });
