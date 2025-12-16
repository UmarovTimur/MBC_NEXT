import fs, { Dirent } from "fs";

export function getDirectories(source: fs.PathLike) {
  return fs.readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
}

export function getFiles(source: fs.PathLike) {
   return fs.readdirSync(source, { withFileTypes: true })
      .filter(f => f.isFile())
      .map(f => f.name);
}

export function readFileContent(filepath: fs.PathLike) {
   return fs.readFileSync(filepath, "utf-8");
}