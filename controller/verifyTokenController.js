const jwt = require("jsonwebtoken");
const { User } = require("../DataBase/index.js");
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
  const { id_user } = req.body;
  if (!id_user) {
    return res.status(403).json({
      status: 501,
      message: "Falta el id_user",
    });
  }
  const user = await User.findByPk(id_user);
  if (!user) {
    return res.status(403).json({
      status: 404,
      message: "No existe este usuario",
    });
  }
  if (user.dataValues.terminos === false) {
    return res.status(403).json({
      status: 403,
      message: "Usuario invalido. No acepto los terminos y condiciones",
    });
  }
  if (user.dataValues.status === false) {
    return res.status(403).json({
      status: 403,
      message: "Usuario invalido. No pago ",
    });
  }
  if (user.dataValues.terminos === true && user.dataValues.status === true) {
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
