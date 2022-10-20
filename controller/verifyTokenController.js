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
  let statusValid = true;
  const { status } = req.session;
  if (status === false) {
    tokenIsValid = false;
  }

  if (tokenIsValid && status === true) {
    return res.status(200).send(tokenIsValid);
  } else {
    return res.status(403).json({
      status: 403,
      message: "Tu usuario tiene un status false",
    });
  }
};

module.exports = {
  verifyToken,
  verifyStatus,
};
