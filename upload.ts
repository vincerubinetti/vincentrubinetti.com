import Client from "ssh2-sftp-client";

const {
  WEBSITE_HOST,
  WEBSITE_PORT,
  WEBSITE_USERNAME,
  WEBSITE_PASSWORD,
  WEBSITE_SOURCE,
  WEBSITE_TARGET,
} = import.meta.env;

const config = {
  host: WEBSITE_HOST,
  port: WEBSITE_PORT,
  username: WEBSITE_USERNAME,
  password: WEBSITE_PASSWORD,
};
const source = WEBSITE_SOURCE;
const target = WEBSITE_TARGET;

const sftp = new Client();
await sftp.connect(config);
sftp.on("upload", (info: { source: unknown }) =>
  console.info(`Uploaded ${info.source}`),
);
const result = await sftp.uploadDir(source, target);
console.info(result);
await sftp.chmod(target + "email.php", 0o755);
sftp.end();
