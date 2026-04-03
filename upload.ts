import Client from "ssh2-sftp-client";

const {
  FTP_HOST: host,
  FTP_PORT: port,
  FTP_USERNAME: username,
  FTP_PASSWORD: password,
  WEBSITE_SOURCE: source,
  WEBSITE_TARGET: target,
} = import.meta.env;

/** upload local directory w/ built website to remote host directory */
const sftp = new Client();
await sftp.connect({ host, port, username, password });
sftp.on("upload", (info) => console.info(`Uploaded ${info.source}`));
const result = await sftp.uploadDir(source, target);
console.info(result);
/** make php file executable */
await sftp.chmod(target + "email.php", 0o755);
sftp.end();
