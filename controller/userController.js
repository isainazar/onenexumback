const { User } = require("../DataBase/index.js");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;
const bcrypt = require("bcrypt");
const generateRandomPassword = require("../utilities/generateRandomPassword");
const { sendEmail } = require("../utilities/sendEmail");
require("dotenv").config();

const createUser = async (req, res, next) => {
  const { username, password, email } = req.body;

  if (!username || !email || !password) {
    return res.status(500).json({ message: "All fields are required" });
  }
  try {
    let user1 = await User.findOne({ where: { email } });
    // Si el correo ya está registrado, devuelvo un error
    if (user1) {
      return res
        .status(500)
        .json({ message: "Ya existe un usuario con este email" });
    }
    let userr = await User.findOne({ where: { username } });
    // Si el username ya está registrado, devuelvo un error
    if (userr) {
      return res
        .status(500)
        .json({ message: "Ya existe un usuario con este username" });
    }

    // Creamos el nuevo usuario y lo guardamos en la DB
    const user = await User.create({
      username,
      email,
      password,
    });

    // generamos el payload/body para generar el token
    const payload = {
      user: {
        id: user.dataValues.id_user,
      },
    };

    jwt.sign(
      payload,
      JWT_SECRET,
      {
        expiresIn: "7d",
      },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({ token });
      }
    );
  } catch (err) {
    console.log(err);
    next({});
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: "Se requiere un usuario o contraseña valido",
    });
  }

  try {
    let user = await User.findOne({
      where: {
        username: username,
      },
    });
    if (!user) {
      return res.status(400).json({
        message: "Este usuario no existe",
      });
    }

    const passwordfinal = bcrypt.compareSync(
      password,
      user.dataValues.password
    );

    if (!passwordfinal) {
      return res.status(400).json({
        message: "Contraseña invalida",
      });
    }

    const payload = {
      user: {
        id: user.dataValues.id_user,
      },
    };

    jwt.sign(
      payload,
      JWT_SECRET,
      {
        expiresIn: "7d",
      },
      (err, token) => {
        if (err) throw err;
        return res.status(200).json({
          token,
        });
      }
    );
  } catch (err) {
    return res.status(500).json({
      message:
        "Error al intentar conectar a la base de datos. Por favor, ponte en contacto con el administrador",
      error: err,
    });
  }
};
const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(500).json({
      message: "Email is required",
    });
  }

  let temporalPassword = generateRandomPassword();

  try {
    const user = await User.findOne({
      where: {
        email,
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ message: "No existe ningun usuario con este email" });
    }

    try {
      const update = await User.update(
        {
          password: temporalPassword,
        },
        {
          where: {
            email,
          },
        }
      );

      if (!update) {
        return res
          .status(404)
          .json({ message: "El usuario no se pudo actualizar" });
      }
      try {
        const mail = await sendEmail(
          "Recuperación de contraseña",
          "",
          false,
          user.dataValues.email,
          `<h2>Contraseña temporal para su usuario en One Nexum</h2><div>Su contraseña temporal es: <code>${temporalPassword}</code><br>Cambiela lo antes posible. Para cambiar su contraseña aprete el sigiuiente link <a href=${process.env.LINK_RESET_PASSWORD}>Apriete aqui</a></div>`
        );
        return res.status(200).json({
          message:
            "Contraseña cambiada con éxito. Se te ha enviado un correo con la contraseña nueva. Te sugerimos cambiarla pronto.",
        });
      } catch (error) {
        return res.status(400).json({
          message: `Error al enviar el correo. `,
        });
      }
    } catch (error) {
      return res.status(400).json({
        message: "No se pudo actualizar la contraseña",
      });
    }
  } catch (error) {
    return res.status(400).json({
      message: "No existe el usuario",
    });
  }
};
const resetPassword = async (req, res) => {
  const { oldPassword, newPassword, email } = req.body;
  /* if (!oldPassword || !newPassword || !email) {
    return res.status(500).json({ message: "Todos los campos son requeridos" });
  } */
  if (newPassword === oldPassword) {
    return res.status(404).json({
      message: "Las contraseñas deben ser diferentes",
    });
  }

  try {
    const user = await User.findOne({
      where: {
        email: email,
      },
    });
    if (!user) {
      return res.status(400).json({
        message: "Este usuario no existe",
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.dataValues.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Contraseña incorrecta",
      });
    }

    const contraseñaNueva = await User.update(
      {
        password: newPassword,
      },
      {
        where: {
          email: email,
        },
      }
    );
    if (contraseñaNueva) {
      return res.status(200).json({
        message: "Contraseña cambiada con éxito",
      });
    } else {
      res.status(400).json({
        message: "No se pudo actualizar su contraseña",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message:
        "Error al intentar conectar a la base de datos. Por favor, ponte en contacto con el administrador",
    });
  }
};

module.exports = {
  login,
  createUser,
  resetPassword,
  forgotPassword,
};
