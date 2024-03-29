import { readFileSync, writeFileSync } from "fs";
import { config as loadEnv } from "dotenv";

const { parsed: env } = loadEnv();

if (!env) process.exit(0);

const file = "./dist/email.php";

let contents = readFileSync(file).toString();

for (const [name, value] of Object.entries(env))
  contents = contents.replaceAll("$" + name, value);

writeFileSync(file, contents);
