const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;

const verifyToken = async (req, res) => {
  let tokenIsValid = true;
  jwt.verify(req.body.token, JWT_SECRET, (err, decoded) => {
    if (err) {
      tokenIsValid = false;
    }
  });

  if (tokenIsValid) {
    return res.status(200).send(tokenIsValid);
  } else {
    return res.status(403).json({
      status: 403,
      message:
        "Tus credenciales de inicio de sesión expiraron. Por favor iniciá sesión de nuevo",
    });
  }
};
const verifyStatus = async (req, res) => {
  const { status, terminos } = req.session;
  if (terminos === false) {
    return res.status(403).json({
      status: 403,
      message: "Usuario invalido. No acepto los terminos y condiciones",
    });
  }
  if (status === false) {
    return res.status(403).json({
      status: 403,
      message: "Usuario invalido. No pago ",
    });
  }
  if (terminos === true && status === true) {
    return res.status(200).send(true);
  } else {
    return res.status(403).json({
      status: 403,
      message: "Error al crear validar el usuario",
    });
  }
};

module.exports = {
  verifyToken,
  verifyStatus,
};
