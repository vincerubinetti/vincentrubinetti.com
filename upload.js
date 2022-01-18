require("dotenv").config();
let Client = require("ssh2-sftp-client");
let sftp = new Client();

const config = {
  host: process.env.WEBSITE_HOST,
  port: process.env.WEBSITE_PORT,
  username: process.env.WEBSITE_USERNAME,
  password: process.env.WEBSITE_PASSWORD,
};

const src = "./_site";
const target = process.env.WEBSITE_TARGET;

const script = async () => {
  await sftp.connect(config);
  sftp.on("upload", (info) => console.log(`Uploaded ${info.source}`));
  const result = await sftp.uploadDir(src, target);
  console.log(result);
  sftp.end();
};

script();
