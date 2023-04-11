const {
  User,
  Login,
  Secciona,
  Seccionb,
  Valoracionsecciona,
  Valoracionseccionb,
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
  const { name, lastname, password, email, user_type } = req.body;

  if (!name || !lastname || !email || !password || !user_type) {
    return res.status(500).json({ message: "Se requieren todos los campos" });
  }

  if (validarEmail(email) === "This email is incorrect") {
    return res.status(501).json({ message: "Este mail no es válido" });
  }

  try {
    let user1 = await User.findOne({ where: { email } });
    // Si el correo ya está registrado, devuelvo un error
    if (user1) {
      return res
        .status(500)
        .json({ message: "Ya existe un usuario con este email" });
    }
    const nombreE = encrypt(name);
    const apellidoE = encrypt(lastname);

    // Creamos el nuevo usuario y lo guardamos en la DB
    const user = await User.create({
      name: nombreE,
      lastname: apellidoE,
      email,
      password,
      user_type,
    });
    // generamos el payload/body para generar el token
    if (!user) {
      return res
        .status(500)
        .json({ message: "No se pudo crear el usuario en la db" });
    }
    var aleatorio = Math.floor(Math.random() * 900000) + 100000;

    const mail = await sendEmail(
      "Verificacion de usuario",
      "",
      false,
      user.dataValues.email,
      `<h2>Creaste un usuario!</h2><div>${name}, necesitamos que verifiques tu usuario. Para lograrlo, necesitas utilizar el codigo:${aleatorio}.`
    );
    if (!mail) {
      return res
        .status(500)
        .json({ message: "No se pudo crear el usuario en la db" });
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
        expiresIn: "1d",
      },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({
          token: token,
          id_user: user.dataValues.id_user,
          codigo: aleatorio,
        });
      }
    );
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
    if (user.dataValues.firstLogin === true) {
      const usuarioCambiado = await User.update(
        {
          // status: true,
          firstLogin: false,
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
            status: user.dataValues.status,
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
    /*  if (user.dataValues.firstLogin === true) {
    
      const usuarioCambiado = await User.update(
        {
          firstLogin: false,
        },
        {
          where: {
            id_user: user.dataValues.id_user,
          },
        }
      );
      const newSeccion_A = await Seccion_A.create({
        id_user: user.dataValues.id_user,
      });
      const newSeccion_B = await Seccion_B.create({
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
          const section_a = await Seccion_A.findOne({
            where: {
              id_user: user.dataValues.id_user,
            },
          });
          const section_b = await Seccion_B.findOne({
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
         console.log(user.dataValues.name)

          const usu = {
            id_user: user.dataValues.id_user,
            name: decrypt(user.dataValues.name),
            lastname: decrypt(user.dataValues.lastname),
            email: user.dataValues.email,
            user_type: user.dataValues.user_type,
            status: user.dataValues.status,
            gender: decrypt(user.dataValues.gender),
            dob: decrypt(user.dataValues.date_birth),
            country: decrypt(user.dataValues.country),
            region: decrypt(user.dataValues.region),
            section_a: section_a,
            section_b: section_b,
          };
          
        //  req.session.user = usu;

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
    } */

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
          status: user.dataValues.status,
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
        const nombre = decrypt(user.dataValues.name);
        await sendEmail(
          "Recuperación de contraseña",
          "",
          false,
          user.dataValues.email,
          `<h2>Contraseña temporal para su usuario de One Nexum</h2><div>${nombre}, su contraseña temporal es: <code>${temporalPassword}</code><br>Para cambiar su contraseña por favor haz click <a href=${process.env.LINK_RESET_PASSWORD}>AQUI</a></div>`
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
      const nombre = decrypt(user.dataValues.name);

      await sendEmail(
        "Cambio de contraseña",
        "",
        false,
        user.dataValues.email,
        `<h2>Cambio de contraseña!</h2><div>${nombre}, su contraseña ha sido cambiado con exito.</div>`
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
  const { name, gender, dob, country, region, user,relationship } = req.body;
  if (!user) {
    return res.status(500).json({ message: "Debes llenar todos los campos" });
  }

  /*  if (validarEmail(email) === "This email is incorrect") {
    return res.status(501).json({ message: "Ingresa un email válido" });
  } */

  console.log(name, gender, dob, country, region, user);
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
        relationship:relationship,
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
        status: true,
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
    const returnedUser = {
      id_user: usuario.dataValues.id_user,
      name: decrypt(usuario.dataValues.name),
      lastname: decrypt(usuario.dataValues.lastname),
      email: usuario.dataValues.email,
      status: usuario.dataValues.status,
      id_payment: usuario.dataValues.idPayment,
      relationship:usuario.dataValues.relationship,
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
  if (completed) {
    const newSeccionA = await Secciona.update(
      {
        completed: true,
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
  if (completed) {
    const newSeccionB = await Seccionb.update(
      {
        completed: true,
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
      return res.status(500).json({ message: "Error al modificar Seccion A" });
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
        message: "Seccion A modificada correctamente",
        data: newSeccionB,
      });
    } else {
      return res.status(500).json({ message: "Error al modificar Seccion A" });
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
        message: "Seccion A modificada correctamente",
        data: newSeccionB,
      });
    } else {
      return res.status(500).json({ message: "Error al modificar Seccion A" });
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
        message: "Seccion A modificada correctamente",
        data: newSeccionB,
      });
    } else {
      return res.status(500).json({ message: "Error al modificar Seccion A" });
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
        message: "Seccion A modificada correctamente",
        data: newSeccionB,
      });
    } else {
      return res.status(500).json({ message: "Error al modificar Seccion A" });
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
        message: "Seccion A modificada correctamente",
        data: newSeccionB,
      });
    } else {
      return res.status(500).json({ message: "Error al modificar Seccion A" });
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
        message: "Seccion A modificada correctamente",
        data: newSeccionB,
      });
    } else {
      return res.status(500).json({ message: "Error al modificar Seccion A" });
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
        message: "Seccion A modificada correctamente",
        data: newSeccionB,
      });
    } else {
      return res.status(500).json({ message: "Error al modificar Seccion A" });
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
        message: "Seccion A modificada correctamente",
        data: newSeccionB,
      });
    } else {
      return res.status(500).json({ message: "Error al modificar Seccion A" });
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
};
