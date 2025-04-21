const { NodeSSH } = require("node-ssh");
const fs = require("fs");
const { exec } = require("child_process");
require("dotenv").config({ path: ".env.deploy" });

const ssh = new NodeSSH();

// Cấu hình server từ biến môi trường hoặc đối tượng cấu hình
const server = {
  host: process.env.SSH_HOST, // IP của server
  username: process.env.SSH_USER, // Tên người dùng SSH
  privateKey: fs.readFileSync(process.env.SSH_KEY_PATH, "utf8"), // Đọc private key từ file
};

// Các tham số build và container
const config = {
  tag: process.env.TAG, // Tag cho image mới
  oldTag: process.env.OLD_TAG, // Tag cho image cũ
  projectPath: process.env.PROJECT_PATH, // Đường dẫn tới dự án trên server
  imageName: process.env.IMAGE_NAME, // Tên image Docker
  containerName: process.env.CONTAINER_NAME, // Tên container
  dockerNetwork: process.env.DOCKER_NETWORK, // Tên mạng Docker
  portMapping: process.env.PORT_MAPPING, // Mappings cổng
};

// Kiểm tra xem các giá trị trong config có bị thiếu không
function validateConfig(config) {
  for (const [key, value] of Object.entries(config)) {
    if (value === undefined || value === null || value === "") {
      console.error(`❌ Thiếu giá trị cấu hình: ${key}`);
      throw new Error(
        `Cấu hình không đầy đủ: ${key} không được phép là undefined/null/empty.`
      );
    }
  }
}

// Hàm build và push Docker image
function buildAndPushImage(tag) {
  return new Promise((resolve, reject) => {
    const command = `docker buildx build --platform linux/amd64,linux/arm64 -t ${config.imageName}:${tag} . --push`;
    console.log("🏗️  Bắt đầu build và push image...");

    exec(command, { cwd: process.cwd() }, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Lỗi khi build: ${error.message}`);
        return reject(error);
      }
      if (stderr) {
        console.warn(`⚠️ stderr: ${stderr}`);
      }
      console.log(`✅ Đã build và push thành công:\n${stdout}`);
      resolve();
    });
  });
}

// Hàm deploy
async function deploy() {
  try {
    console.log("Checking config...");
    console.log(config);
    validateConfig(config);
    // Bắt đầu build và push image
    await buildAndPushImage(config.tag);

    // Kết nối SSH đến server
    console.log("🔐 Kết nối SSH...");
    await ssh.connect(server);

    console.log("🧼 Dừng và xoá container cũ...");
    await ssh.execCommand(
      `sudo docker stop ${config.containerName} && sudo docker rm ${config.containerName}`,
      {
        cwd: config.projectPath,
      }
    );

    console.log("🧽 Xoá image cũ...");
    await ssh.execCommand(
      `sudo docker image rm ${config.imageName}:${config.oldTag}`,
      {
        cwd: config.projectPath,
      }
    );

    console.log("🚀 Chạy container mới...");
    await ssh.execCommand(
      `sudo docker run -d \
        --name ${config.containerName} \
        --network ${config.dockerNetwork} \
        -p 0.0.0.0:${config.portMapping} \
        ${config.imageName}:${config.tag}`,
      { cwd: config.projectPath }
    );

    console.log("✅ Deploy thành công!");

    console.log("🔍 Kiểm tra log từ container...");
    const result = await ssh.execCommand(
      `sudo docker logs -f ${config.containerName}`
    );
    console.log("Log từ container:\n", result.stdout);
  } catch (error) {
    console.error("❌ Lỗi deploy:", error.message);
  } finally {
    ssh.dispose();
  }
}

deploy();
