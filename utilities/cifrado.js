const crypto = require("crypto");
const CIFRADO_SECRET = "83928392839";
require("dotenv").config();

const algorithm = "aes-192-cbc";

const encrypt = (text) => {
  //generate encryption key using the secret.
  crypto.scrypt(CIFRADO_SECRET, "salt", 24, (err, key) => {
    if (err) throw err;

    //create an initialization vector
    crypto.randomFill(new Uint8Array(16), (err, iv) => {
      if (err) throw err;

      const cipher = crypto.createCipheriv(algorithm, key, iv);

      let encrypted = "";
      cipher.setEncoding("hex");

      cipher.on("data", (chunk) => (encrypted += chunk));
      cipher.on("end", () => console.log(encrypted));
      cipher.on("error", (err) => console.log(err));

      cipher.write(text);
      cipher.end();
    });
  });
};
//console.log(encrypt("nico"));

const decrypt = (encrypted, iv) => {
  //generate encryption key using secret
  crypto.scrypt(CIFRADO_SECRET, "salt", 24, (err, key) => {
    if (err) throw err;

    //create decipher object
    const decipher = crypto.createDecipheriv(algorithm, key, iv);

    let decrypted = "";
    decipher.on("readable", () => {
      while (null !== (chunk = decipher.read())) {
        decrypted += chunk.toString("utf8");
      }
    });
    decipher.on("end", () => console.log(decrypted));
    decipher.on("error", (err) => console.log(err));

    decipher.write(encrypted, "hex");
    decipher.end();
  });
};
console.log(decrypt("nicola", Uint8Array(16)));
