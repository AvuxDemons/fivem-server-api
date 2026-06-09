import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const target = resolve(__dirname, "..", "dist", "esm", "package.json");

writeFileSync(target, JSON.stringify({ type: "module" }, null, 2) + "\n");
console.log("Created dist/esm/package.json");
