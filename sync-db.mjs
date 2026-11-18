
import { writeFile } from "node:fs/promises";
import jobs from "./src/data/jobs.js";

await writeFile(
  new URL("./db.json", import.meta.url),
  JSON.stringify({ jobs }, null, 2),
  "utf8"
);

console.log("db.json updated with " + jobs.length + " jobs.");
