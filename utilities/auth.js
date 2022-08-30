const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;
const { User } = require("../DataBase/index");

module.exports = async (req, res, next) => {
  // el token viene en el header de la petición, lo tomamos:
  const token = req.header("Authorization");

  // Si no nos han proporcionado un token lanzamos un error
  if (!token) {
    return res.status(403).json({
      status: 403,
      message: "Token not found",
    });
  }

  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.json({
        meta: {
          status: 401,
        },
        data: {
          message: "Token inválida",
        },
      });
    } else {
      req.decoded = decoded;
      try {
        let user = await User.findByPk(decoded.user.id);

        req.user = user.dataValues;

        next();
      } catch (error) {
        return res.json({
          status: 400,
          message: "No hay un usuario registrado con esa contraseña",
        });
      }
    }
  });
};
