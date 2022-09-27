const { User } = require("../DataBase/index.js");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;
const bcrypt = require("bcrypt");
const generateRandomPassword = require("../utilities/generateRandomPassword");
const { sendEmail } = require("../utilities/sendEmail");
require("dotenv").config();
function validarEmail(valor) {
  if (
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      valor
    )
  ) {
    return "This email is corect";
  } else {
    return "This email is incorrect";
  }
}

const createUser = async (req, res, next) => {
  const {
    name,
    lastname,
    password,
    email,
    date_birth,
    country,
    region,
    gender,
    user_type,
  } = req.body;

  if (
    !name ||
    !lastname ||
    !email ||
    !password ||
    !country ||
    !region ||
    !gender ||
    !date_birth
  ) {
    return res.status(500).json({ message: "All fields are required" });
  }

  if (validarEmail(email) === "This email is incorrect") {
    return res.status(501).json({ message: "This mail doesn't exists" });
  }
  try {
    let user1 = await User.findOne({ where: { email } });
    // Si el correo ya está registrado, devuelvo un error
    if (user1) {
      return res
        .status(500)
        .json({ message: "Ya existe un usuario con este email" });
    }

    // Creamos el nuevo usuario y lo guardamos en la DB
    const user = await User.create({
      name,
      lastname,
      email,
      password,
      date_birth,
      country,
      region,
      gender,
      user_type,
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
        res
          .status(201)
          .json({ token: token, id_user: user.dataValues.id_user });
      }
    );
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Elije un genero valido", error: err });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Se requiere un usuario o contraseña valido",
    });
  }

  try {
    let user = await User.findOne({
      where: {
        email: email,
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
        return res
          .status(200)
          .json({ token: token, id_user: user.dataValues.id_user });
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
  if (!oldPassword || !newPassword || !email) {
    return res.status(500).json({ message: "Todos los campos son requeridos" });
  }
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

const updateGender = async (req, res) => {
  try {
    const { id_user } = req.params;
    const { gender } = req.body;

    const usuarioGender = await User.update(
      {
        gender,
      },
      {
        where: {
          id_user,
        },
      }
    );
    if (!usuarioGender) {
      return res.satus(404).json({ message: "User Couldn't be changed" });
    }
    return res.status(200).json({ message: "User change correctly" });
  } catch (err) {
    // console.log(err)
    return res.status(400).json(err);
  }
};
const updateRelationship = async (req, res) => {
  try {
    const { id_user } = req.params;
    const { relationship } = req.body;

    const usuarioRelationship = await User.update(
      {
        relationship,
      },
      {
        where: {
          id_user,
        },
      }
    );
    if (!usuarioRelationship) {
      return res.satus(404).json({ message: "User Couldn't be changed" });
    }
    return res.status(200).json({ message: "User change correctly" });
  } catch (err) {
    // console.log(err)
    return res.status(400).json(err);
  }
};
const updateOcupation = async (req, res) => {
  try {
    const { id_user } = req.params;
    const { ocupation } = req.body;

    const usuarioOcupation = await User.update(
      {
        ocupation,
      },
      {
        where: {
          id_user,
        },
      }
    );
    if (!usuarioOcupation) {
      return res.satus(404).json({ message: "User Couldn't be changed" });
    }
    return res.status(200).json({ message: "User change correctly" });
  } catch (err) {
    // console.log(err)
    return res.status(400).json(err);
  }
};
const updateUnemployed = async (req, res) => {
  try {
    const { id_user } = req.params;
    const { unemployed } = req.body;

    const usuarioUnemployed = await User.update(
      {
        unemployed,
      },
      {
        where: {
          id_user,
        },
      }
    );
    if (!usuarioUnemployed) {
      return res.satus(404).json({ message: "User Couldn't be changed" });
    }
    return res.status(200).json({ message: "User change correctly" });
  } catch (err) {
    // console.log(err)
    return res.status(400).json(err);
  }
};
const loginWithGoogle = async (req, res, next) => {
  const { email, name, lastname } = req.body;

  const password = await bcrypt.hash(process.env.PASSWORD_GLOBAL_GOOGLE, 10);

  try {
    const [user, created] = await User.findOrCreate({
      where: {
        email,
      },
      defaults: {
        name,
        lastname,
        password,
      },
    });

    if (user || created) {
      const payload = {
        user: { id: user.dataValues.id_user },
      };
      jwt.sign(
        payload,
        JWT_SECRET,
        {
          expiresIn: "3d",
        },
        (err, token) => {
          if (err) throw err;
          return res.json({ token });
        }
      );
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

module.exports = {
  login,
  createUser,
  resetPassword,
  forgotPassword,
  updateGender,
  updateRelationship,
  updateOcupation,
  updateUnemployed,
  loginWithGoogle,
};
