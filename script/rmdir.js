const fs = require("fs");
const path = require("path");

// удаляем dist
const distPath = path.resolve(__dirname, "../dist");
fs.rmSync(distPath, { recursive: true, force: true });
