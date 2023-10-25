const fs = require("fs");
const path = require("path");
const { globSync } = require("glob");

// удаляем dist
const distPath = path.resolve(__dirname, "../dist");
fs.rmSync(distPath, { recursive: true, force: true });

// переносим lua файлы из папки lua
const luaPath = path.resolve(__dirname, "../src/lua");
const luaPathGlob = path.resolve(luaPath, "**/*.lua");
const luaFiles = globSync(luaPathGlob, {
  withFileTypes: true,
  windowsPathsNoEscape: true,
});

luaFiles.forEach((file) => {
  const rootPath = path.join(distPath, "lua");
  const relativePath = path.relative(luaPath, file.path);
  const newDir = path.join(rootPath, relativePath);

  if (!fs.existsSync(newDir)) {
    fs.mkdirSync(newDir, {
      recursive: true,
    });
  }

  const newPath = path.join(newDir, file.name);
  fs.copyFileSync(file.fullpath(), newPath);
});
