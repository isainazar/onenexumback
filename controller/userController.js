const { User, Login, Encrypted } = require("../DataBase/index.js");
const Stripe = require("stripe");
const KEY_PRIVATE_STRIPE = process.env.KEY_PRIVATE_STRIPE;
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
    !date_birth ||
    !user_type
  ) {
    return res.status(500).json({ message: "All fields are required" });
  }
  if (
    gender === "Masculino" ||
    gender === "Femenino" ||
    gender === "Binario" ||
    gender === "Otro"
  ) {
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
      const date = date_birth.toString();
      const nombreE = encrypt(name);
      const apellidoE = encrypt(lastname);
      const dateE = encrypt(date);
      const countryE = encrypt(country);
      const regionE = encrypt(region);
      const genderE = encrypt(gender);

      // Creamos el nuevo usuario y lo guardamos en la DB
      const user = await User.create({
        name: nombreE.encryptedData,
        lastname: apellidoE.encryptedData,
        email,
        password,
        date_birth: dateE.encryptedData,
        country: countryE.encryptedData,
        region: regionE.encryptedData,
        gender: genderE.encryptedData,
        user_type,
      });
      /* req.cookies.id_user = user.id_user;
      req.cookies.nombre = name;
      req.cookies.email = email;
      req.cookies.password = password;
      req.cookies.date_birth = date_birth;
      req.cookies.country = country;
      req.cookies.region = region;
      req.cookies.gender = gender;
      req.cookies.user_type = user_type;
      req.cookies.status = false;
      req.cookies.terminos = false;
      req.cookies.progress = 0; */
      /* const options = { httpOnly: true, secure: true, sameSite: "lax" };
      res.cookie("id_user", user.id_user, options);
      res.cookie("name", name, options);
      res.cookie("lastname", lastname, options);
      res.cookie("email", email, options);
      res.cookie("date_birth", date_birth, options);
      res.cookie("country", country, options);
      res.cookie("region", region, options);
      res.cookie("gender", gender, options);
      res.cookie("user_type", user_type, options);
      res.cookie("status", false, options);
      res.cookie("terminos", false, options);
      res.cookie("progress", 0, options); */
      /*  console.log(req.cookies); */
      // generamos el payload/body para generar el token
      if (!user) {
        return res
          .status(500)
          .json({ message: "No se pudo crear el usuario en la db" });
      }
      await Encrypted.create({
        encryptedDataName: nombreE.encryptedData,
        ivName: nombreE.iv,
        encryptedDataLastname: apellidoE.encryptedData,
        ivLastname: apellidoE.iv,
        encryptedDataDatebirth: dateE.encryptedData,
        ivDatebirth: dateE.iv,
        encryptedDataCountry: countryE.encryptedData,
        ivCountry: countryE.iv,
        encryptedDataRegion: regionE.encryptedData,
        ivRegion: regionE.iv,
        encryptedDataGender: genderE.encryptedData,
        ivGender: genderE.iv,
        id_user: user.dataValues.id_user,
      });

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
          res
            .status(201)
            .json({ token: token, id_user: user.dataValues.id_user });
        }
      );
    } catch (err) {
      return res.status(500).json({ error: err });
    }
  } else {
    return res.status(500).json({ message: "Genero invalido" });
  }
};

const login = async (req, res) => {
  const { email, password, idPayment } = req.body;

  if (!email || !password) {
    return res.status(400).json({
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
    if (user.dataValues.firstLogin === true) {
      const session = await stripe.checkout.sessions.retrieve(idPayment);
      if (session.payment_status === "paid") {
        const usuarioCambiado = await User.update(
          {
            status: true,
            firstLogin: false,
          },
          {
            where: {
              id_user: user.dataValues.id_user,
            },
          }
        );
        if (usuarioCambiado) {
          try {
            const newLogin = await Login.create({
              id_user: user.dataValues.id_user,
            });

            const newLoginDef = await Promise.all(await newLogin.addUser(user));
            if (!newLogin || !newLoginDef) {
              return res.status(400).json({
                message: "No se pudo guardar el login",
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
                expiresIn: "1d",
              },
              (err, token) => {
                if (err) throw err;
                return res.status(200).json({
                  token: token,
                  id_user: user.dataValues.id_user,
                });
              }
            );
          } catch (error) {
            return res.status(500).json({
              message:
                "Error al intentar conectar a la base de datos. Por favor, ponte en contacto con el administrador",
              error: err,
            });
          }
        } else {
          return res.status(401).json({
            message: "No se ha podido actualizar el usuario",
          });
        }
      } else {
        return res.status(402).json({
          message: "Tu compra no ha sido exitosa",
        });
      }
    }
    const newLogin = await Login.create({
      id_user: user.dataValues.id_user,
    });

    const newLoginDef = await Promise.all(await newLogin.addUser(user));
    if (!newLogin || !newLoginDef) {
      return res.status(400).json({
        message: "No se pudo guardar el login",
      });
    }
    /*  req.session.id_user = user.dataValues.id_user;
    req.session.nombre = user.dataValues.name;
    req.session.lastname = user.dataValues.lastname;
    req.session.email = user.dataValues.email;
    req.session.password = user.dataValues.password;
    req.session.date_birth = user.dataValues.date_birth;
    req.session.country = user.dataValues.country;
    req.session.region = user.dataValues.region;
    req.session.gender = user.dataValues.gender;
    req.session.user_type = user.dataValues.user_type;
    req.session.status = user.dataValues.status;
    req.session.progress = user.dataValues.progress;
    req.session.terminos = user.dataValues.terminos; */
    /* const options = { httpOnly: true, secure: true, sameSite: "lax" };

    res.cookie("id_user", user.dataValues.id_user, options);
    res.cookie("name", user.dataValues.name, options);
    res.cookie("lastname", user.dataValues.lastname, options);
    res.cookie("email", user.dataValues.email, options);
    res.cookie("date_birth", user.dataValues.date_birth, options);
    res.cookie("country", user.dataValues.country, options);
    res.cookie("region", user.dataValues.region, options);
    res.cookie("gender", user.dataValues.gender, options);
    res.cookie("user_type", user.dataValues.user_type, options);
    res.cookie("status", user.dataValues.status, options);
    res.cookie("terminos", user.dataValues.terminos, options);
    res.cookie("progress", user.dataValues.progress, options);
 */
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
      include: [
        {
          model: Encrypted,
        },
      ],
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
        /* req.session.password = temporalPassword; */
        const textNombre = {
          encryptedData: user.dataValues.encrypted.dataValues.encryptedDataName,
          iv: user.dataValues.encrypted.dataValues.ivName,
        };
        const nombre = decrypt(textNombre);
        await sendEmail(
          "Recuperación de contraseña",
          "",
          false,
          user.dataValues.email,
          `<h2>Contraseña temporal para su usuario en One Nexum</h2><div>${nombre}, su contraseña temporal es: <code>${temporalPassword}</code><br>Cambiela lo antes posible. Para cambiar su contraseña aprete el sigiuiente link <a href=${process.env.LINK_RESET_PASSWORD}>Apriete aqui</a></div>`
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
      include: [
        {
          model: Encrypted,
        },
      ],
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
      const textNombre = {
        encryptedData: user.dataValues.encrypted.dataValues.encryptedDataName,
        iv: user.dataValues.encrypted.dataValues.ivName,
      };
      const nombre = decrypt(textNombre);

      /* req.session.password = newPassword; */
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
  console.log(id_user);
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
    //req.session.terminos = true;
    return res.status(200).json({ message: "Usuario cambiado correctamente" });
  } else {
    return res
      .status(404)
      .json({ message: "Error al intentar cambiar el usuario" });
  }
};

module.exports = {
  login,
  createUser,
  resetPassword,
  forgotPassword,
  updateTerminos,
};
