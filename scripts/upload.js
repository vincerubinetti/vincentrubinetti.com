import { config as loadEnv } from "dotenv";
import Client from "ssh2-sftp-client";

const { parsed: env } = loadEnv();

if (!env) process.exit(0);

const config = {
  host: env.WEBSITE_HOST,
  port: env.WEBSITE_PORT,
  username: env.WEBSITE_USERNAME,
  password: env.WEBSITE_PASSWORD,
};
const source = env.WEBSITE_SOURCE;
const target = env.WEBSITE_TARGET;

(async () => {
  const sftp = new Client();
  await sftp.connect(config);
  sftp.on("upload", (info) => console.info(`Uploaded ${info.source}`));
  const result = await sftp.uploadDir(source, target);
  console.info(result);
  sftp.end();
})();
