const crypto = require("crypto");
const { Buffer } = require("buffer");
require("dotenv").config();
process.env = Object.assign(
  {
    PASSWORD: "Pa$$w0rd",
  },
  process.env
);
const algorithm = "aes-256-cbc"; //Using AES encryption

/* const algorithm = "aes-256-cbc";
const salt = crypto.randomBytes(16);
const key = crypto.scryptSync(process.env.PASSWORD, salt, 32);
const iv = crypto.randomBytes(16); */

function encrypt(text) {
  let iv = crypto.randomBytes(16);
  let salt = crypto.randomBytes(16);
  let key = crypto.scryptSync(process.env.PASSWORD, salt, 32);

  let cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  return `${iv.toString("hex")}:${salt.toString("hex")}:${encrypted}`;
}

function decrypt(text) {
  let [ivs, salts, data] = text.split(":");
  let iv = Buffer.from(ivs, "hex");
  let salt = Buffer.from(salts, "hex");
  let key = crypto.scryptSync(process.env.PASSWORD, salt, 32);

  let decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(data, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted.toString();
}

/* var hw = encrypt("holacomoestas soy juaaaaaaanpablo");
console.log(hw);
console.log(decrypt(hw)); */

module.exports = {
  encrypt,
  decrypt,
};
