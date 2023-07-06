const {
  User,
  Login,
  Secciona,
  Seccionb,
  Valoracionsecciona,
  Valoracionseccionb,
  Trabajo,
  Gustoseintereses,
} = require("../DataBase/index.js");
models = require("../DataBase/index.js");
const Stripe = require("stripe");
const KEY_PRIVATE_STRIPE = process.env.KEY_PRIVATE_STRIPE;
const URL = process.env.URL;
const stripe = new Stripe(KEY_PRIVATE_STRIPE);
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;
const bcrypt = require("bcrypt");
const generateRandomPassword = require("../utilities/generateRandomPassword");
const { sendEmail } = require("../utilities/sendEmail");
const { encrypt, decrypt } = require("../utilities/cifrado");
const { checkUserPaymentStatus } = require("./stripeController.js");
const {
  verificationCode,
  resetPassCode,
  successPassChange,
} = require("../utilities/mailTemplates.js");
const validarEmail = require("../utilities/validarEmail.js");
const { codeIsValid } = require("../utilities/codeIsValid.js");
require("dotenv").config();

const createUser = async (req, res, next) => {
  const { name, lastname, password, email, user_type, quiz } = req.body;

  if (!name || !lastname || !email || !password || !user_type) {
    return res.status(500).json({ message: "Se requieren todos los campos" });
  }

  if (validarEmail(email) === "This email is incorrect") {
    return res.status(501).json({ message: "Este mail no es válido" });
  }

  let userExists = await User.findOne({ where: { email } });
  // Si el correo ya está registrado, devuelvo un error

  if (userExists) {
    if (userExists.dataValues.email) {
      return res
        .status(502)
        .json({ message: "Ya existe un usuario con este email" });
    }
  }

  try {
    const nombreE = encrypt(name);
    const apellidoE = encrypt(lastname);
    //validation code
    let aleatorio = Math.floor(Math.random() * 900000) + 100000;
    const user = await User.create({
      name: nombreE,
      lastname: apellidoE,
      email,
      password,
      user_type,
      verificationCode: aleatorio,
    });
    if (!user) {
      return res
        .status(500)
        .json({ message: "No se pudo crear el usuario en la db" });
    }
    const mail = await sendEmail(
      "Verificacion de usuario",
      "",
      false,
      user.dataValues.email,
      await verificationCode(name, aleatorio)
    );
    if (!mail) {
      return res
        .status(500)
        .json({ message: "No se pudo crear el usuario en la db" });
    }
    const createdUser = await User.findOne({ where: { email } });
    return res.status(200).json({ id_user: createdUser.dataValues.id_user });
  } catch (err) {
    return res.status(500).json({ error: err });
  }
};
const login = async (req, res) => {
  const { email, password } = req.body;
if (!email || !password) {
    return res.status(505).json({
      message: "Se requiere un usuario o contraseña valido",
    });
  }

  try {
    const user = await User.findOne({
      where: {
        email: email,
      },
    });
    if (!user) {
      return res.status(405).json({
        message: "Este usuario no existe",
      });
    }
    const passwordfinal = bcrypt.compareSync(
      password,
      user.dataValues.password
    );
    if (!passwordfinal) {
      return res.status(404).json({
        message: "Contraseña inválida",
      });
    }
    // FIRST LOGIN
    
    if (user.dataValues.hasLoggedInFirstTime === false) {
      const usuarioCambiado = await User.update(
        {
          hasLoggedInFirstTime: true,
        },
        {
          where: {
            id_user: user.dataValues.id_user,
          },
        }
      );

      const newSeccion_A = await Secciona.create({
        id_user: user.dataValues.id_user,
      });
      const newSeccion_B = await Seccionb.create({
        id_user: user.dataValues.id_user,
      });
      const newValoracion_A = await Valoracionsecciona.create({
        id_user: user.dataValues.id_user,
      });
      const newValoracion_B = await Valoracionseccionb.create({
        id_user: user.dataValues.id_user,
      });

      if (
        usuarioCambiado &&
        newSeccion_A &&
        newSeccion_B &&
        newValoracion_A &&
        newValoracion_B
      ) {
        try {
          const section_a = await Secciona.findOne({
            where: {
              id_user: user.dataValues.id_user,
            },
          });
          const section_b = await Seccionb.findOne({
            where: {
              id_user: user.dataValues.id_user,
            },
          });
          const newLogin = await Login.create({
            id_user: user.dataValues.id_user,
          });
          const newLoginDef = await Promise.all(await newLogin.addUser(user));
          if (!newLogin || !newLoginDef) {
            return res.status(409).json({
              message: "No se pudo guardar el login",
            });
          }

          const nombre = decrypt(user.dataValues.name);
          const apellido = decrypt(user.dataValues.lastname);

          const usu = {
            id_user: user.dataValues.id_user,
            name: nombre,
            lastname: apellido,
            email: user.dataValues.email,
            user_type: user.dataValues.user_type,
            status: user.dataValues.hasPremiumPack,
            gender: user.dataValues.gender,
            relationship: user.dataValues.relationship,
            dob: user.dataValues.dob,
            country: user.dataValues.country,
            region: user.dataValues.region,
            section_a: section_a,
            section_b: section_b,
          };
          req.session.user = usu;
          const payload = {
            user: {
              id: user.dataValues.id_user,
            },
          };
          jwt.sign(
            payload,
            JWT_SECRET,
            {
              expiresIn: "1d",
            },
            (err, token) => {
              if (err) throw err;
              return res.status(200).json({
                token: token,
                id_user: user.dataValues.id_user,
                userLogged: true,
              });
            }
          );
        } catch (error) {
          return res.status(502).json({
            message:
              "Error al intentar conectar a la base de datos. Por favor, ponte en contacto con el administrador",
            error: err,
          });
        }
      } else {
        return res.status(403).json({
          message: "No se ha podido actualizar el usuario",
        });
      }
    }
    // SI YA EL USUARIO SE LOGEÓ POR PRIMERA VEZ
    else {
      const newLogin = await Login.create({
        id_user: user.dataValues.id_user,
      });

      const newLoginDef = await Promise.all(await newLogin.addUser(user));
      if (!newLogin || !newLoginDef) {
        return res.status(409).json({
          message: "No se pudo guardar el login",
        });
      }
      const nombre = decrypt(user.dataValues.name);
      const apellido = decrypt(user.dataValues.lastname);
      const section_a = await Secciona.findOne({
        where: {
          id_user: user.dataValues.id_user,
        },
      });
      const section_b = await Seccionb.findOne({
        where: {
          id_user: user.dataValues.id_user,
        },
      });
      try {
        const usu = {
          id_user: user.dataValues.id_user,
          name: nombre,
          lastname: apellido,
          email: user.dataValues.email,
          user_type: user.dataValues.user_type,
          status: user.dataValues.hasPremiumPack,
          gender: user.dataValues.gender,
          dob: user.dataValues.date_birth,
          relationship: user.dataValues.relationship,
          country: user.dataValues.country,
          region: user.dataValues.region,
          section_a: section_a,
          section_b: section_b,
          id_payment: user.dataValues.idPayment,
          section_a: section_a,
          section_b: section_b,
        };

        req.session.user = usu;
        const payload = {
          user: {
            id: user.dataValues.id_user,
          },
        };
        jwt.sign(
          payload,
          JWT_SECRET,
          {
            expiresIn: "1d",
          },
          (err, token) => {
            if (err) throw err;
            return res.status(200).json({
              token: token,
              id_user: user.dataValues.id_user,
              userLogged: true,
              usuario: usu,
            });
          }
        );
      } catch (err) {
        return res.status(510).json({
          message:
            "Error al intentar conectar a la base de datos. Por favor, ponte en contacto con el administrador",
          error: err,
        });
      }
    }
  } catch (err) {
    return res.status(500).json({
      message: "Error",
      error: err,
    });
  }
};

const codeValidation = async (req, res) => {
  const { id_user, code } = req.body;
  if (!id_user || !code) {
    return res.status(505).json({
      message: "Se requiere toda la info",
    });
  }
  console.log(code);
  const user = await User.findOne({ where: { id_user } });
  if (!user) {
    return res.status(404).json({ message: "Usuario no encontrado" });
  }
  const isValid = codeIsValid(user.dataValues.verificationCode, code);
  console.log(user.dataValues.verificationCode)

  if (isValid === false) {
    return res.status(204).json({ message: "El código es incorrecto" });
  }
  try {
    return res.status(200).json({ message: "Codigo Correcto" });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(500).json({
      message: "Es necesario el email",
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
        const name = decrypt(user.dataValues.name);
        await sendEmail(
          "Recuperación de contraseña",
          "",
          false,
          user.dataValues.email,
          await resetPassCode(name, temporalPassword)
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
      message: "Las contraseña nueva debe ser diferente a la anterior",
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
        message: "La contraseña actual es incorrecta",
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
      const name = decrypt(user.dataValues.name);

      await sendEmail(
        "Cambio de contraseña",
        "",
        false,
        user.dataValues.email,
        await successPassChange(name)
      );

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
const updateTerminos = async (req, res) => {
  const { id_user } = req.body;
  if (!id_user) {
    return res.status(500).json({ message: "Faltan campos" });
  }
  const usuarioCambiado = await User.update(
    {
      terminos: true,
    },
    {
      where: {
        id_user,
      },
    }
  );
  if (usuarioCambiado) {
    return res.status(200).json({ message: "Usuario cambiado correctamente" });
  } else {
    return res
      .status(404)
      .json({ message: "Error al intentar cambiar el usuario" });
  }
};
const getSession = async (req, res) => {
  // Si, por ejemplo, no hay nombre
  if (!req.session) {
    res.status(400).json({ message: "No existe una session en este momento" });
  }
  return res.status(200).json(req.session.user);
};
const updateMailAccepted = async (req, res) => {
  const { id_user } = req.body;

  if (!id_user) {
    return res.status(500).json({ message: "Faltan campos" });
  }
  const usuarioCambiado = await User.update(
    {
      mail_accepted: true,
    },
    {
      where: {
        id_user,
      },
    }
  );
  if (usuarioCambiado) {
    return res.status(200).json({ message: "Usuario cambiado correctamente" });
  } else {
    return res
      .status(404)
      .json({ message: "Error al intentar cambiar el usuario" });
  }
};

const updateUser = async (req, res, next) => {
  const { name, gender, dob, country, region, user, relationship } = req.body;
  if (!user) {
    return res.status(204).json({ message: "Debes llenar todos los campos" });
  }
  /*  if (validarEmail(email) === "This email is incorrect") {
    return res.status(501).json({ message: "Ingresa un email válido" });
  } */

  try {
    const nombreE = encrypt(name);
    const dateE = encrypt(dob);
    const countryE = encrypt(country);
    const regionE = encrypt(region);
    const genderE = encrypt(gender);

    const userr = await User.update(
      {
        name: nombreE,
        date_birth: dateE,
        country: countryE,
        region: regionE,
        gender: genderE,
        relationship: relationship,
      },
      {
        where: {
          id_user: user,
        },
      }
    );
    if (userr) {
      return res.status(200).json({ message: "Usuario actualizado" });
    } else {
      return res
        .status(500)
        .json({ message: "No se pudo modificar el usuario en la db" });
    }
  } catch (err) {
    return res.status(500).json({ error: err });
  }
};

const updatePayment = async (req, res) => {
  const { id_user } = req.body;
  const usuario = await User.findByPk(id_user);

  if (!usuario) {
    return res.status(404).json({ message: "Este usuario no existe" });
  }
  try {
    const updateUser = await User.update(
      {
        hasPremiumPack: true,
      },
      {
        where: {
          id_user: usuario.dataValues.id_user,
        },
      }
    );
    return res.status(200).json({ message: updateUser });
  } catch (err) {
    return res.status(500).json({ error: err });
  }
};

const didUserPaid = async (idPayment, id_user) => {
  const info = await checkUserPaymentStatus(idPayment, id_user);
  if (info.payment_status) {
    try {
      const updateUser = await User.update(
        {
          hasPremiumPack: true,
        },
        {
          where: {
            id_user: id_user,
          },
        }
      );
      // return res.status(200).json({ message: updateUser });
    } catch (err) {
      return res.status(500).json({ error: err });
    }
  }
};

const didCompleteProfile = async (id_user) => {
  if (!id_user) {
    return false;
  }
  const usuario = await User.findByPk(id_user);
  if (!usuario) {
    return false;
  }

  const trabajo = await Trabajo.findOne({
    where: {
      id_user: usuario.dataValues.id_user,
    },
  });
  const gustos = await Gustoseintereses.findOne({
    where: {
      id_user: usuario.dataValues.id_user,
    },
  });

  if (
    !trabajo ||
    !gustos ||
    !trabajo.first_time_completed ||
    !gustos.first_time_completed
  ) {
    return false;
  }
  return true;
};
const getUserData = async (req, res) => {
  const { id_user } = req.params;
  if (!id_user) {
    return res.status(404).json({ message: "Falta información" });
  }
  const usuario = await User.findByPk(id_user);
  if (!usuario) {
    return res.status(404).json({ message: "Usuario no encontrado" });
  }
  try {
    const section_a = await Secciona.findOne({
      where: {
        id_user: usuario.dataValues.id_user,
      },
    });
    const section_b = await Seccionb.findOne({
      where: {
        id_user: usuario.dataValues.id_user,
      },
    });
    const profile = await didCompleteProfile(id_user);

    if (!usuario.dataValues.status) {
      if (usuario.dataValues.idPayment !== null) {
        const idPayment = usuario.dataValues.idPayment;
        const id_user = usuario.dataValues.id_user;
        await didUserPaid(idPayment, id_user);
      }
    }

    const returnedUser = {
      id_user: usuario.dataValues.id_user,
      name: decrypt(usuario.dataValues.name),
      lastname: decrypt(usuario.dataValues.lastname),
      email: usuario.dataValues.email,
      status: usuario.dataValues.hasPremiumPack,
      id_payment: usuario.dataValues.idPayment,
      relationship: usuario.dataValues.relationship,
      gender:
        usuario.dataValues.gender === null
          ? usuario.dataValues.gender
          : decrypt(usuario.dataValues.gender),
      dob:
        usuario.dataValues.date_birth === null
          ? usuario.dataValues.date_birth
          : decrypt(usuario.dataValues.date_birth),
      country:
        usuario.dataValues.country === null
          ? usuario.dataValues.country
          : decrypt(usuario.dataValues.country),
      region:
        usuario.dataValues.region === null
          ? usuario.dataValues.region
          : decrypt(usuario.dataValues.region),
      section_a: section_a,
      section_b: section_b,
      profile: profile,
    };
    return res.status(200).json({ usuario: returnedUser });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

const postSeccion_A = async (req, res) => {
  const { user } = req.body;

  if (!user.id_user) {
    return res.status(403).json({ message: "Falta informacion" });
  }
  const userr = await User.findByPk(user.id_user);
  if (!userr) {
    return res.status(403).json({ message: "Usuario inexistente" });
  }
  const newSeccion_A = await Seccion_A.create({
    id_user: userr.dataValues.id_user,
  });

  if (newSeccion_A) {
    return res.status(200).json({
      message: "Seccion A creada correctamente",
      data: newSeccion_A,
    });
  } else {
    return res.status(500).json({ message: "Error al crear Seccion A" });
  }
};
const postSeccion_B = async (req, res) => {
  const { user } = req.body;
  if (!user.id_user) {
    return res.status(403).json({ message: "Falta informacion" });
  }
  const userr = await User.findByPk(user.id_user);
  if (!userr) {
    return res.status(403).json({ message: "Usuario inexistente" });
  }
  const newSeccionB = await Seccion_B.create({
    id_user: userr.dataValues.id_user,
  });

  if (newSeccionB) {
    return res.status(200).json({
      message: "Seccion A creada correctamente",
      data: newSeccionB,
    });
  } else {
    return res.status(500).json({ message: "Error al crear Seccion A" });
  }
};
const putSeccion_A = async (req, res) => {
  const {
    completed,
    exercise1_started,
    exercise1_completed,
    exercise2_started,
    exercise2_completed,
    exercise3_started,
    exercise3_completed,
    bonus_started,
    bonus_completed,
  } = req.body;
  const { user } = req.body;
  if (!user) {
    return res.status(403).json({ message: "Falta informacion" });
  }
  const usuario = await User.findByPk(user);
  if (!usuario) {
    return res.status(403).json({ message: "Usuario inexistente" });
  }
  if (exercise3_completed && completed) {
    const newSeccionA = await Secciona.update(
      {
        completed: true,
        exercise3_completed: true,
      },
      {
        where: {
          id_user: usuario.dataValues.id_user,
        },
      }
    );

    if (newSeccionA) {
      return res.status(200).json({
        message: "Seccion A modificada correctamente",
        data: newSeccionA,
      });
    } else {
      return res.status(500).json({ message: "Error al modificar Seccion A" });
    }
  }
  if (exercise1_started) {
    const newSeccionA = await Secciona.update(
      {
        exercise1_started: true,
      },
      {
        where: {
          id_user: usuario.dataValues.id_user,
        },
      }
    );
    if (newSeccionA) {
      return res.status(200).json({
        message: "Seccion A modificada correctamente",
        data: newSeccionA,
      });
    } else {
      return res.status(500).json({ message: "Error al modificar Seccion A" });
    }
  }
  if (exercise1_completed) {
    const newSeccionA = await Secciona.update(
      {
        exercise1_completed: true,
      },
      {
        where: {
          id_user: usuario.dataValues.id_user,
        },
      }
    );
    if (newSeccionA) {
      return res.status(200).json({
        message: "Seccion A modificada correctamente",
        data: newSeccionA,
      });
    } else {
      return res.status(500).json({ message: "Error al modificar Seccion A" });
    }
  }
  if (exercise2_started) {
    const newSeccionA = await Secciona.update(
      {
        exercise2_started: true,
      },
      {
        where: {
          id_user: usuario.dataValues.id_user,
        },
      }
    );
    if (newSeccionA) {
      return res.status(200).json({
        message: "Seccion A modificada correctamente",
        data: newSeccionA,
      });
    } else {
      return res.status(500).json({ message: "Error al modificar Seccion A" });
    }
  }
  if (exercise2_completed) {
    const newSeccionA = await Secciona.update(
      {
        exercise2_completed: true,
      },
      {
        where: {
          id_user: usuario.dataValues.id_user,
        },
      }
    );
    if (newSeccionA) {
      return res.status(200).json({
        message: "Seccion A modificada correctamente",
        data: newSeccionA,
      });
    } else {
      return res.status(500).json({ message: "Error al modificar Seccion A" });
    }
  }
  if (exercise3_started) {
    const newSeccionA = await Secciona.update(
      {
        exercise3_started: true,
      },
      {
        where: {
          id_user: usuario.dataValues.id_user,
        },
      }
    );
    if (newSeccionA) {
      return res.status(200).json({
        message: "Seccion A modificada correctamente",
        data: newSeccionA,
      });
    } else {
      return res.status(500).json({ message: "Error al modificar Seccion A" });
    }
  }
  if (exercise3_completed) {
    const newSeccionA = await Secciona.update(
      {
        exercise3_completed: true,
      },
      {
        where: {
          id_user: usuario.dataValues.id_user,
        },
      }
    );
    if (newSeccionA) {
      return res.status(200).json({
        message: "Seccion A modificada correctamente",
        data: newSeccionA,
      });
    } else {
      return res.status(500).json({ message: "Error al modificar Seccion A" });
    }
  }
  if (bonus_started) {
    const newSeccionA = await Secciona.update(
      {
        bonus_started: true,
      },
      {
        where: {
          id_user: usuario.dataValues.id_user,
        },
      }
    );
    if (newSeccionA) {
      return res.status(200).json({
        message: "Seccion A modificada correctamente",
        data: newSeccionA,
      });
    } else {
      return res.status(500).json({ message: "Error al modificar Seccion A" });
    }
  }
  if (bonus_completed) {
    const newSeccionA = await Secciona.update(
      {
        bonus_completed: true,
      },
      {
        where: {
          id_user: usuario.dataValues.id_user,
        },
      }
    );
    if (newSeccionA) {
      return res.status(200).json({
        message: "Seccion A modificada correctamente",
        data: newSeccionA,
      });
    } else {
      return res.status(500).json({ message: "Error al modificar Seccion A" });
    }
  }
};
const putSeccion_B = async (req, res) => {
  const {
    completed,
    exercise1_started,
    exercise1_completed,
    exercise2_started,
    exercise2_completed,
    exercise3_started,
    exercise3_completed,
    bonus_started,
    bonus_completed,
  } = req.body;
  const { user } = req.body;
  if (!user) {
    return res.status(403).json({ message: "Falta informacion" });
  }
  const usuario = await User.findByPk(user);
  if (!usuario) {
    return res.status(403).json({ message: "Usuario inexistente" });
  }
  if (completed && exercise3_completed) {
    const newSeccionB = await Seccionb.update(
      {
        completed: true,
        exercise3_completed: true,
      },
      {
        where: {
          id_user: usuario.dataValues.id_user,
        },
      }
    );
    if (newSeccionB) {
      return res.status(200).json({
        message: "Seccion A modificada correctamente",
        data: newSeccionB,
      });
    } else {
      return res.status(500).json({ message: "Error al modificar Seccion B" });
    }
  }
  if (exercise1_started) {
    const newSeccionB = await Seccionb.update(
      {
        exercise1_started: true,
      },
      {
        where: {
          id_user: usuario.dataValues.id_user,
        },
      }
    );
    if (newSeccionB) {
      return res.status(200).json({
        message: "Seccion B modificada correctamente",
        data: newSeccionB,
      });
    } else {
      return res.status(500).json({ message: "Error al modificar Seccion B" });
    }
  }
  if (exercise1_completed) {
    const newSeccionB = await Seccionb.update(
      {
        exercise1_completed: true,
      },
      {
        where: {
          id_user: usuario.dataValues.id_user,
        },
      }
    );
    if (newSeccionB) {
      return res.status(200).json({
        message: "Seccion B modificada correctamente",
        data: newSeccionB,
      });
    } else {
      return res.status(500).json({ message: "Error al modificar Seccion B" });
    }
  }
  if (exercise2_started) {
    const newSeccionB = await Seccionb.update(
      {
        exercise2_started: true,
      },
      {
        where: {
          id_user: usuario.dataValues.id_user,
        },
      }
    );
    if (newSeccionB) {
      return res.status(200).json({
        message: "Seccion B modificada correctamente",
        data: newSeccionB,
      });
    } else {
      return res.status(500).json({ message: "Error al modificar Seccion B" });
    }
  }
  if (exercise2_completed) {
    const newSeccionB = await Seccionb.update(
      {
        exercise2_completed: true,
      },
      {
        where: {
          id_user: usuario.dataValues.id_user,
        },
      }
    );
    if (newSeccionB) {
      return res.status(200).json({
        message: "Seccion B modificada correctamente",
        data: newSeccionB,
      });
    } else {
      return res.status(500).json({ message: "Error al modificar Seccion B" });
    }
  }
  if (exercise3_started) {
    const newSeccionB = await Seccionb.update(
      {
        exercise3_started: true,
      },
      {
        where: {
          id_user: usuario.dataValues.id_user,
        },
      }
    );
    if (newSeccionB) {
      return res.status(200).json({
        message: "Seccion B modificada correctamente",
        data: newSeccionB,
      });
    } else {
      return res.status(500).json({ message: "Error al modificar Seccion B" });
    }
  }
  if (exercise3_completed) {
    const newSeccionB = await Seccionb.update(
      {
        exercise3_completed: true,
      },
      {
        where: {
          id_user: usuario.dataValues.id_user,
        },
      }
    );
    if (newSeccionB) {
      return res.status(200).json({
        message: "Seccion B modificada correctamente",
        data: newSeccionB,
      });
    } else {
      return res.status(500).json({ message: "Error al modificar Seccion B" });
    }
  }
  if (bonus_started) {
    const newSeccionB = await Seccionb.update(
      {
        bonus_started: true,
      },
      {
        where: {
          id_user: usuario.dataValues.id_user,
        },
      }
    );
    if (newSeccionB) {
      return res.status(200).json({
        message: "Seccion B modificada correctamente",
        data: newSeccionB,
      });
    } else {
      return res.status(500).json({ message: "Error al modificar Seccion B" });
    }
  }
  if (bonus_completed) {
    const newSeccionB = await Seccionb.update(
      {
        bonus_completed: true,
      },
      {
        where: {
          id_user: usuario.dataValues.id_user,
        },
      }
    );
    if (newSeccionB) {
      return res.status(200).json({
        message: "Seccion B modificada correctamente",
        data: newSeccionB,
      });
    } else {
      return res.status(500).json({ message: "Error al modificar Seccion B" });
    }
  }
};

// USER TEST
const getTest = async (req, res) => {
  const { user } = req.params;
  const { testid } = req.query;
  const testArray = [
    "Testpersonalidad1",
    "Testpersonalidad2",
    "Testpersonalidad3",
    "Testpersonalidad4",
    "Testpersonalidad5",
  ];
  if (!user || !testid) {
    return res.status(501).json({ message: "Falta informacion" });
  }
  try {
    const userDb = await User.findOne({
      where: {
        id_user: user,
      },
    });
    const test = await models[testArray[testid - 1]].findOne({
      where: {
        id_user: user,
      },
    });
    if (userDb && test) {
      return res.status(200).json({ message: test });
    } else {
      return res.status(200).json({ message: 0 });
    }
  } catch (err) {
    return res.status(500).json({ message: "Error Inesperado" });
  }
};

const getAllTest = async (req, res) => {
  const { user } = req.params;
  const testArray = [
    "Testpersonalidad1",
    "Testpersonalidad2",
    "Testpersonalidad3",
    "Testpersonalidad4",
    "Testpersonalidad5",
  ];
  const tests = [];
  if (!user) {
    return res.status(501).json({ message: "Falta informacion" });
  }
  try {
    const userDb = await User.findOne({
      where: {
        id_user: user,
      },
    });

    for (let i = 0; i < testArray.length; i++) {
      let result;
      const test = await models[testArray[i]].findOne({
        where: {
          id_user: user,
        },
      });
      if (!test) {
        result = null;
        tests.push(result);
      } else {
        result = test.dataValues.result;
        tests.push(result);
      }
    }

    if (userDb && tests) {
      return res.status(200).json({ message: tests });
    }
  } catch (err) {
    return res.status(500).json({ message: "Error Inesperado" });
  }
};

const postTest = async (req, res) => {
  const { user, result, testid } = req.body;
  const testArray = [
    "Testpersonalidad1",
    "Testpersonalidad2",
    "Testpersonalidad3",
    "Testpersonalidad4",
    "Testpersonalidad5",
  ];

  if (!user) {
    return res.status(403).json({ message: "Falta informacion" });
  }
  const userr = await User.findByPk(user);
  if (!userr) {
    return res.status(403).json({ message: "Usuario inexistente" });
  }
  const newTest = await models[testArray[testid]].create({
    id_user: userr.dataValues.id_user,
    result,
    completed: true,
  });

  if (newTest) {
    return res.status(200).json({
      message: "Test creado correctamente",
      data: newTest,
    });
  } else {
    return res.status(500).json({ message: "Error al crear Test" });
  }
};

const putTest = async (req, res) => {
  const { result, user, testid } = req.body;
  const testArray = [
    "Testpersonalidad1",
    "Testpersonalidad2",
    "Testpersonalidad3",
    "Testpersonalidad4",
    "Testpersonalidad5",
  ];
  if (!user || !result) {
    return res.status(403).json({ message: "Falta informacion" });
  }
  const usuario = await User.findByPk(user);
  if (!usuario) {
    return res.status(403).json({ message: "Usuario inexistente" });
  }

  try {
    const updateTest = await models[testArray[testid]].update(
      {
        result: result,
      },
      {
        where: {
          id_user: usuario.dataValues.id_user,
        },
      }
    );
    if (!updateTest) {
      return res.status(510).json({ message: "no se pudo actualizar el test" });
    }
    return res.status(200).json({ message: "Actualizado correctamente" });
  } catch (err) {
    return res.status(500).json({ message: "Ocurrio un error" });
  }
};

// VALORACION DE EJERCICIOS

const getValoracionA = async (req, res) => {
  const { user } = req.params;
  if (!user) {
    return res.status(501).json({ message: "Falta informacion" });
  }
  const usuario = await User.findByPk(user);
  if (!usuario) {
    return res.status(501).json({ message: "No existe el usuario" });
  }
  try {
    const valoracion = await Valoracionsecciona.findOne({
      where: { id_user: usuario.dataValues.id_user },
    });
    return res.status(200).json({ message: valoracion || [] });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};
const getValoracionB = async (req, res) => {
  const { user } = req.params;
  if (!user) {
    return res.status(501).json({ message: "Falta informacion" });
  }
  const usuario = await User.findByPk(user);
  if (!usuario) {
    return res.status(501).json({ message: "No existe el usuario" });
  }
  try {
    const valoracion = await Valoracionseccionb.findOne({
      where: { id_user: usuario.dataValues.id_user },
    });
    return res.status(200).json({ message: valoracion || [] });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

const putValoracion_A = async (req, res) => {
  const {
    valoracion_exercise_1,
    valoracion_exercise_2,
    valoracion_exercise_3,
    valoracion_bonus,
  } = req.body;
  const { user } = req.body;
  if (!user) {
    return res.status(403).json({ message: "Falta informacion" });
  }
  const userr = await User.findByPk(user);
  if (!userr) {
    return res.status(403).json({ message: "Usuario inexistente" });
  }
  if (valoracion_exercise_1) {
    const newValoracionA = await Valoracionsecciona.update(
      {
        valoracion_exercise_1: valoracion_exercise_1,
      },
      {
        where: {
          id_user: userr.dataValues.id_user,
        },
      }
    );
    if (newValoracionA) {
      return res.status(200).json({
        message: "Seccion A modificada correctamente",
        data: newValoracionA,
      });
    } else {
      return res.status(500).json({ message: "Error al modificar Seccion A" });
    }
  }
  if (valoracion_exercise_2) {
    const newValoracionA = await Valoracionsecciona.update(
      {
        valoracion_exercise_2: valoracion_exercise_2,
      },
      {
        where: {
          id_user: userr.dataValues.id_user,
        },
      }
    );
    if (newValoracionA) {
      return res.status(200).json({
        message: "Seccion A modificada correctamente",
        data: newValoracionA,
      });
    } else {
      return res.status(500).json({ message: "Error al modificar Seccion A" });
    }
  }
  if (valoracion_exercise_3) {
    const newValoracionA = await Valoracionsecciona.update(
      {
        valoracion_exercise_3: valoracion_exercise_3,
      },
      {
        where: {
          id_user: userr.dataValues.id_user,
        },
      }
    );
    if (newValoracionA) {
      return res.status(200).json({
        message: "Seccion A modificada correctamente",
        data: newValoracionA,
      });
    } else {
      return res.status(500).json({ message: "Error al modificar Seccion A" });
    }
  }
  if (valoracion_bonus) {
    const newValoracionA = await Valoracionsecciona.update(
      {
        valoracion_bonus: valoracion_bonus,
      },
      {
        where: {
          id_user: userr.dataValues.id_user,
        },
      }
    );
    if (newValoracionA) {
      return res.status(200).json({
        message: "Seccion A modificada correctamente",
        data: newValoracionA,
      });
    } else {
      return res.status(500).json({ message: "Error al modificar Seccion A" });
    }
  }
};
const putValoracion_B = async (req, res) => {
  const {
    valoracion_exercise_1,
    valoracion_exercise_2,
    valoracion_exercise_3,
    valoracion_bonus,
  } = req.body;
  const { user } = req.body;
  if (!user) {
    return res.status(403).json({ message: "Falta informacion" });
  }
  const userr = await User.findByPk(user.id_user);
  if (!userr) {
    return res.status(403).json({ message: "Usuario inexistente" });
  }
  if (valoracion_exercise_1) {
    const newValoracionA = await Valoracionseccionb.update(
      {
        valoracion_exercise_1: valoracion_exercise_1,
      },
      {
        where: {
          id_user: userr.dataValues.id_user,
        },
      }
    );
    if (newValoracionA) {
      return res.status(200).json({
        message: "Seccion A modificada correctamente",
        data: newValoracionA,
      });
    } else {
      return res.status(500).json({ message: "Error al modificar Seccion A" });
    }
  }
  if (valoracion_exercise_2) {
    const newValoracionA = await Valoracionseccionb.update(
      {
        valoracion_exercise_2: valoracion_exercise_2,
      },
      {
        where: {
          id_user: userr.dataValues.id_user,
        },
      }
    );
    if (newValoracionA) {
      return res.status(200).json({
        message: "Seccion A modificada correctamente",
        data: newValoracionA,
      });
    } else {
      return res.status(500).json({ message: "Error al modificar Seccion A" });
    }
  }
  if (valoracion_exercise_3) {
    const newValoracionA = await Valoracionseccionb.update(
      {
        valoracion_exercise_3: valoracion_exercise_3,
      },
      {
        where: {
          id_user: userr.dataValues.id_user,
        },
      }
    );
    if (newValoracionA) {
      return res.status(200).json({
        message: "Seccion A modificada correctamente",
        data: newValoracionA,
      });
    } else {
      return res.status(500).json({ message: "Error al modificar Seccion A" });
    }
  }
  if (valoracion_bonus) {
    const newValoracionA = await Valoracionseccionb.update(
      {
        valoracion_bonus: valoracion_bonus,
      },
      {
        where: {
          id_user: userr.dataValues.id_user,
        },
      }
    );
    if (newValoracionA) {
      return res.status(200).json({
        message: "Seccion A modificada correctamente",
        data: newValoracionA,
      });
    } else {
      return res.status(500).json({ message: "Error al modificar Seccion A" });
    }
  }
};

const resendEmail = async (req, res) => {
  const { email, name } = req.body;

  let aleatorio = Math.floor(Math.random() * 900000) + 100000;
  if (!email || !name) {
    return res.status(400).json({ message: "Faltan datos" });
  }
  const user = await User.findOne({ where: {email} });
  if (!user) {
    return res.status(404).json({ message: "Usuario no encontrado" });
  }
  const updateCode = await User.update(
    {
      verificationCode: aleatorio,
    },
    { where: {id_user: user.dataValues.id_user} }
  );
  if(!updateCode){
    return res.status(500).json({message:"No se pudo actualizar el código"})
  }
  

  const mail = await sendEmail(
    "Verificacion de usuario",
    "",
    false,
    email,
    `<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
    <head>
    <title>Activa tu cuenta One Nexum</title>
    <!--[if !mso]><!-->
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <!--<![endif]-->
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style type="text/css">
    #outlook a{padding:0;}body{margin:0;padding:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}table,td{border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;}img{border:0;height:auto;line-height:100%;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;}p{display:block;margin:0;}
    </style>
    <!--[if mso]> <noscript><xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
    <![endif]-->
    <!--[if lte mso 11]>
    <style type="text/css">
    .ogf{width:100% !important;}
    </style>
    <![endif]-->
    <!--[if !mso]><!-->
    <link href="https://fonts.googleapis.com/css?family=Inter:700,400" rel="stylesheet" type="text/css">
    <style type="text/css">
    
    </style>
    <!--<![endif]-->
    <style type="text/css">
    @media only screen and (min-width:599px){.pc100{width:100%!important;max-width:100%;}.pc47-0149{width:47.0149%!important;max-width:47.0149%;}.pc5-9701{width:5.9701%!important;max-width:5.9701%;}.xc568{width:568px!important;max-width:568px;}.xc600{width:600px!important;max-width:600px;}.xc536{width:536px!important;max-width:536px;}}
    </style>
    <style media="screen and (min-width:599px)">.moz-text-html .pc100{width:100%!important;max-width:100%;}.moz-text-html .pc47-0149{width:47.0149%!important;max-width:47.0149%;}.moz-text-html .pc5-9701{width:5.9701%!important;max-width:5.9701%;}.moz-text-html .xc568{width:568px!important;max-width:568px;}.moz-text-html .xc600{width:600px!important;max-width:600px;}.moz-text-html .xc536{width:536px!important;max-width:536px;}
    </style>
    <style type="text/css">
    @media only screen and (max-width:598px){table.fwm{width:100%!important;}td.fwm{width:auto!important;}}
    </style>
    <style type="text/css">
    u+.emailify .gs{background:#000;mix-blend-mode:screen;display:inline-block;padding:0;margin:0;}u+.emailify .gd{background:#000;mix-blend-mode:difference;display:inline-block;padding:0;margin:0;}p{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;}u+.emailify a,#MessageViewBody a,a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important;font-size:inherit!important;font-family:inherit!important;font-weight:inherit!important;line-height:inherit!important;}td.b .klaviyo-image-block{display:inline;vertical-align:middle;}
    @media only screen and (max-width:599px){.emailify{height:100%!important;margin:0!important;padding:0!important;width:100%!important;}u+.emailify .glist{margin-left:1em!important;}td.ico.v>div.il>a.l.m,td.ico.v .mn-label{padding-right:0!important;padding-bottom:16px!important;}td.x{padding-left:0!important;padding-right:0!important;}.fwm img{max-width:100%!important;height:auto!important;}.aw img{width:auto!important;margin-left:auto!important;margin-right:auto!important;}.ah img{height:auto!important;}td.b.nw>table,td.b.nw a{width:auto!important;}td.stk{border:0!important;}td.u{height:auto!important;}br.sb{display:none!important;}.thd-1 .i-thumbnail{display:inline-block!important;height:auto!important;overflow:hidden!important;}.hd-1{display:block!important;height:auto!important;overflow:visible!important;}.ht-1{display:table!important;height:auto!important;overflow:visible!important;}.hr-1{display:table-row!important;height:auto!important;overflow:visible!important;}.hc-1{display:table-cell!important;height:auto!important;overflow:visible!important;}div.r.pr-16>table>tbody>tr>td,div.r.pr-16>div>table>tbody>tr>td{padding-right:16px!important}div.r.pl-16>table>tbody>tr>td,div.r.pl-16>div>table>tbody>tr>td{padding-left:16px!important}}
    </style>
    <meta name="color-scheme" content="light dark">
    <meta name="supported-color-schemes" content="light dark">
    <!--[if gte mso 9]>
    <style>a:link,span.MsoHyperlink{mso-style-priority:99;color:inherit;text-decoration:none;}a:visited,span.MsoHyperlinkFollowed{mso-style-priority:99;color:inherit;text-decoration:none;}
    </style>
    <![endif]-->
    <!--[if gte mso 9]>
    <style>li{text-indent:-1em;}
    </style>
    <![endif]-->
    </head>
    <body lang="en" link="#DD0000" vlink="#DD0000" class="emailify" style="mso-line-height-rule:exactly;word-spacing:normal;background-color:#1e1e1e;"><div style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">Por favor confirma tu email.</div><div class="bg" style="background-color:#1e1e1e;" lang="en">
    <!--[if mso | IE]>
    <table align="center" border="0" cellpadding="0" cellspacing="0" class="r-outlook -outlook pr-16-outlook pl-16-outlook -outlook" role="presentation" style="width:600px;" width="600"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;">
    <![endif]--><div class="r  pr-16 pl-16" style="background:#fffffe;background-color:#fffffe;margin:0px auto;max-width:600px;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#fffffe;background-color:#fffffe;width:100%;"><tbody><tr><td style="border:none;direction:ltr;font-size:0;padding:32px 32px 32px 32px;text-align:left;">
    <!--[if mso | IE]>
    <table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="width:536px;">
    <![endif]--><div class="pc100 ogf" style="font-size:0;line-height:0;text-align:left;display:inline-block;width:100%;direction:ltr;">
    <!--[if mso | IE]>
    <table border="0" cellpadding="0" cellspacing="0" role="presentation"><tr><td style="vertical-align:middle;width:251px;">
    <![endif]--><div class="pc47-0149 ogf m c" style="font-size:0;text-align:left;direction:ltr;display:inline-block;vertical-align:middle;width:47.0149%;">
    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border:none;vertical-align:middle;" width="100%"><tbody><tr><td align="left" class="i" style="font-size:0;padding:0;word-break:break-word;">
    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0;"><tbody><tr><td style="width:71px;"> <a href="onenexum.com" target="_blank" title> <img alt="One Nexum Logo" src="https://e.hypermatic.com/03b5e4db36a26c12f5c650538938482e.png" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" title width="71" height="auto"></a>
    </td></tr></tbody></table>
    </td></tr></tbody></table></div>
    <!--[if mso | IE]>
    </td><td style="vertical-align:top;width:31px;">
    <![endif]--><div class="pc5-9701 ogf g" style="font-size:0;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:5.9701%;">
    <table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"><tbody><tr><td style="vertical-align:top;padding:0;">
    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style width="100%"><tbody></tbody></table>
    </td></tr></tbody></table></div>
    <!--[if mso | IE]>
    </td><td style="vertical-align:middle;width:251px;">
    <![endif]--><div class="pc47-0149 ogf c" style="font-size:0;text-align:left;direction:ltr;display:inline-block;vertical-align:middle;width:47.0149%;">
    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border:none;vertical-align:middle;" width="100%"><tbody><tr><td align="right" class="x" style="font-size:0;word-break:break-word;"><div style="text-align:right;"><p style="Margin:0;text-align:right;mso-line-height-alt:125%"><span style="font-size:16px;font-family:Inter,Arial,sans-serif;font-weight:700;color:#000000;line-height:125%;">Comienza ahora tu viaje de transformaci&oacute;n.</span></p></div>
    </td></tr></tbody></table></div>
    <!--[if mso | IE]>
    </td></tr></table>
    <![endif]--></div>
    <!--[if mso | IE]>
    </td></tr></table>
    <![endif]-->
    </td></tr></tbody></table></div>
    <!--[if mso | IE]>
    </td></tr></table>
    <table align="center" border="0" cellpadding="0" cellspacing="0" class="r-outlook -outlook pr-16-outlook pl-16-outlook -outlook" role="presentation" style="width:600px;" width="600"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;">
    <![endif]--><div class="r  pr-16 pl-16" style="background:#fffffe;background-color:#fffffe;margin:0px auto;max-width:600px;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#fffffe;background-color:#fffffe;width:100%;"><tbody><tr><td style="border:none;direction:ltr;font-size:0;padding:24px 16px 24px 16px;text-align:left;">
    <!--[if mso | IE]>
    <table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="c-outlook -outlook -outlook" style="vertical-align:middle;width:568px;">
    <![endif]--><div class="xc568 ogf c" style="font-size:0;text-align:left;direction:ltr;display:inline-block;vertical-align:middle;width:100%;">
    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border:none;vertical-align:middle;" width="100%"><tbody><tr><td align="center" class="x  m" style="font-size:0;padding-bottom:8px;word-break:break-word;"><div style="text-align:center;"><p style="Margin:0;text-align:center;mso-line-height-alt:121%"><span style="font-size:28px;font-family:Inter,Arial,sans-serif;font-weight:700;color:#000000;line-height:121%;">Bienvenido a One Nexum, ${name}</span></p></div>
    </td></tr><tr><td align="center" class="x  m" style="font-size:0;padding-bottom:8px;word-break:break-word;"><div style="text-align:center;"><p style="Margin:0;text-align:center;mso-line-height-alt:133%"><span style="font-size:18px;font-family:Inter,Arial,sans-serif;font-weight:400;color:#000000;line-height:133%;">Por favor confirma tu correo electr&oacute;nico</span></p></div>
    </td></tr><tr><td class="s" style="font-size:0;padding:0;padding-bottom:0;word-break:break-word;" aria-hidden="true"><div style="height:4px;line-height:4px;">&#8202;</div>
    </td></tr></tbody></table></div>
    <!--[if mso | IE]>
    </td></tr></table>
    <![endif]-->
    </td></tr></tbody></table></div>
    <!--[if mso | IE]>
    </td></tr></table>
    <table align="center" border="0" cellpadding="0" cellspacing="0" class="r-outlook -outlook pr-16-outlook pl-16-outlook -outlook" role="presentation" style="width:600px;" width="600"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;">
    <![endif]--><div class="r  pr-16 pl-16" style="background:#fffffe;background-color:#fffffe;margin:0px auto;max-width:600px;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#fffffe;background-color:#fffffe;width:100%;"><tbody><tr><td style="border:none;direction:ltr;font-size:0;padding:0px 0px 3px 0px;text-align:center;">
    <!--[if mso | IE]>
    <table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="c-outlook -outlook -outlook" style="vertical-align:middle;width:600px;">
    <![endif]--><div class="xc600 ogf c" style="font-size:0;text-align:left;direction:ltr;display:inline-block;vertical-align:middle;width:100%;">
    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border:none;vertical-align:middle;" width="100%"><tbody><tr><td align="center" class="x" style="font-size:0;word-break:break-word;"><div style="text-align:center;"><p style="Margin:0;text-align:center;mso-line-height-alt:114%"><span style="font-size:36px;font-family:Inter,Arial,sans-serif;font-weight:700;color:#000000;line-height:114%;">${aleatorio}</span></p></div>
    </td></tr></tbody></table></div>
    <!--[if mso | IE]>
    </td></tr></table>
    <![endif]-->
    </td></tr></tbody></table></div>
    <!--[if mso | IE]>
    </td></tr></table>
    <table align="center" border="0" cellpadding="0" cellspacing="0" class="r-outlook -outlook pr-16-outlook pl-16-outlook -outlook" role="presentation" style="width:600px;" width="600"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;">
    <![endif]--><div class="r  pr-16 pl-16" style="background:#fffffe;background-color:#fffffe;margin:0px auto;max-width:600px;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#fffffe;background-color:#fffffe;width:100%;"><tbody><tr><td style="border:none;direction:ltr;font-size:0;padding:32px 32px 32px 32px;text-align:left;">
    <!--[if mso | IE]>
    <table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="c-outlook -outlook -outlook" style="vertical-align:middle;width:536px;">
    <![endif]--><div class="xc536 ogf c" style="font-size:0;text-align:left;direction:ltr;display:inline-block;vertical-align:middle;width:100%;">
    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border:none;vertical-align:middle;" width="100%"><tbody><tr><td align="center" class="x" style="font-size:0;word-break:break-word;"><div style="text-align:center;"><p style="Margin:0;text-align:center;mso-line-height-alt:150%"><span style="font-size:16px;font-family:Inter,Arial,sans-serif;font-weight:400;color:#777777;line-height:150%;">Para terminar de registrarte, ingresa el c&oacute;digo en la pantalla de verificaci&oacute;n de registro. Esto asegura que tengamos el correo electr&oacute;nico correcto en caso de que necesitemos comunicarnos contigo.</span></p></div>
    </td></tr></tbody></table></div>
    <!--[if mso | IE]>
    </td></tr></table>
    <![endif]-->
    </td></tr></tbody></table></div>
    <!--[if mso | IE]>
    </td></tr></table>
    <table align="center" border="0" cellpadding="0" cellspacing="0" class="r-outlook -outlook pr-16-outlook pl-16-outlook -outlook" role="presentation" style="width:600px;" width="600"><tr><td style="line-height:0;font-size:0;mso-line-height-rule:exactly;">
    <![endif]--><div class="r  pr-16 pl-16" style="background:#fffffe;background-color:#fffffe;margin:0px auto;max-width:600px;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#fffffe;background-color:#fffffe;width:100%;"><tbody><tr><td style="border:none;direction:ltr;font-size:0;padding:32px 32px 32px 32px;text-align:left;">
    <!--[if mso | IE]>
    <table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="c-outlook -outlook -outlook" style="vertical-align:middle;width:536px;">
    <![endif]--><div class="xc536 ogf c" style="font-size:0;text-align:left;direction:ltr;display:inline-block;vertical-align:middle;width:100%;">
    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border:none;vertical-align:middle;" width="100%"><tbody><tr><td align="center" class="i  m" style="font-size:0;padding:0;padding-bottom:16px;word-break:break-word;">
    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0;"><tbody><tr><td style="width:44px;"> <a href="onenexum.com" target="_blank" title> <img alt="One Nexum Logo" src="https://e.hypermatic.com/b59da696d8df6bad00ef5a2d8a2a7c94.png" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" title width="44" height="auto"></a>
    </td></tr></tbody></table>
    </td></tr><tr><td align="center" class="x  m" style="font-size:0;padding-bottom:16px;word-break:break-word;"><div style="text-align:center;"><p style="Margin:0;text-align:center;mso-line-height-alt:123%"><span style="font-size:13px;font-family:Inter,Arial,sans-serif;font-weight:400;color:#4d4d4d;line-height:123%;">One Nexum Team</span></p></div>
    </td></tr><tr><td align="center" class="o" style="font-size:0;padding:0;padding-bottom:0;word-break:break-word;">
    <!--[if mso | IE]>
    <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation"><tr><td>
    <![endif]-->
    <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="float:none;display:inline-table;"><tbody><tr class="e  m"><td style="padding:0 16px 0 0;vertical-align:middle;">
    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:20px;"><tbody><tr><td style="font-size:0;height:20px;vertical-align:middle;width:20px;"> <a href="https://www.instagram.com/onenexum" target="_blank"> <img alt="Instagram" title height="20" src="https://e.hypermatic.com/4e7a16f289bb761c39a1e699e78ed090.png" style="display:block;" width="20"></a>
    </td></tr></tbody></table>
    </td></tr></tbody></table>
    <!--[if mso | IE]>
    </td><td>
    <![endif]-->
    <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="float:none;display:inline-table;"><tbody><tr class="e  "><td style="padding:0;padding-right:0;vertical-align:middle;">
    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:20px;"><tbody><tr><td style="font-size:0;height:20px;vertical-align:middle;width:20px;"> <a href="onenexum.com" target="_blank"> <img alt="Twitter" title height="20" src="https://e.hypermatic.com/86ac6d6eb7607dbe67ab8b6c85b6434d.png" style="display:block;" width="20"></a>
    </td></tr></tbody></table>
    </td></tr></tbody></table>
    <!--[if mso | IE]>
    </td></tr></table>
    <![endif]-->
    </td></tr></tbody></table></div>
    <!--[if mso | IE]>
    </td></tr></table>
    <![endif]-->
    </td></tr></tbody></table></div>
    <!--[if mso | IE]>
    </td></tr></table>
    <![endif]--></div>
    </body>
    </html>`
  );
  if (!mail) {
    return res
      .status(501)
      .json({ message: "Error al enviar el email, contactar a soporte" });
  }
  return res.status(200).json({ message: aleatorio });
};
module.exports = {
  login,
  createUser,
  resetPassword,
  forgotPassword,
  getSession,
  updateTerminos,
  updateMailAccepted,
  updateUser,
  updatePayment,
  postSeccion_A,
  postSeccion_B,
  putSeccion_A,
  putSeccion_B,
  getUserData,
  postTest,
  putValoracion_A,
  putValoracion_B,
  getTest,
  putTest,
  getAllTest,
  getValoracionA,
  getValoracionB,
  resendEmail,
  didCompleteProfile,
  codeValidation,
};
