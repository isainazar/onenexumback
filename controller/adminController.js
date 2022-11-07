const {
  User,
  Daily,
  Quiz,
  Encrypted,
  Newsletter,
} = require("../DataBase/index.js");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;
const bcrypt = require("bcrypt");
const { encrypt, decrypt } = require("../utilities/cifrado");
require("dotenv").config();

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      include: [
        {
          association: "dailies",
          through: {
            attributes: [],
          },
        },
        {
          association: "logins",
          through: {
            attributes: [],
          },
        },
        {
          model: Quiz,
        },
        {
          model: Encrypted,
        },
      ],
    });
    if (users.length !== 0) {
      // console.log(users);

      const usuarios = users.map((u) => {
        const textNombre = {
          encryptedData: u.dataValues.encrypted.dataValues.encryptedDataName,
          iv: u.dataValues.encrypted.dataValues.ivName,
        };
        const textApellido = {
          encryptedData:
            u.dataValues.encrypted.dataValues.encryptedDataLastname,
          iv: u.dataValues.encrypted.dataValues.ivLastname,
        };
        const textDate = {
          encryptedData:
            u.dataValues.encrypted.dataValues.encryptedDataDatebirth,
          iv: u.dataValues.encrypted.dataValues.ivDatebirth,
        };
        const textCountry = {
          encryptedData: u.dataValues.encrypted.dataValues.encryptedDataCountry,
          iv: u.dataValues.encrypted.dataValues.ivCountry,
        };
        const textRegion = {
          encryptedData: u.dataValues.encrypted.dataValues.encryptedDataRegion,
          iv: u.dataValues.encrypted.dataValues.ivRegion,
        };
        const textGender = {
          encryptedData: u.dataValues.encrypted.dataValues.encryptedDataGender,
          iv: u.dataValues.encrypted.dataValues.ivGender,
        };

        const nombre = decrypt(textNombre);
        const apellido = decrypt(textApellido);
        const date = decrypt(textDate);
        const countryy = decrypt(textCountry);
        const regionn = decrypt(textRegion);
        const genderr = decrypt(textGender);

        const usu = {
          id_user: u.dataValues.id_user,
          name: nombre,
          lastname: apellido,
          email: u.dataValues.email,
          date_birth: date,
          country: countryy,
          region: regionn,
          gender: genderr,
          relationship: u.dataValues.relationship,
          ocupation: u.dataValues.ocupation,
          unemployed: u.dataValues.unemployed,
          user_type: u.dataValues.user_type,
          status: u.dataValues.status,
          terminos: u.dataValues.terminos,
          progress: u.dataValues.progress,
          firstLogin: u.dataValues.firstLogin,
          createdAt: u.dataValues.createdAt,
          updatedAt: u.dataValues.updatedAt,
          dailies: u.dataValues.dailies,
          logins: u.dataValues.logins,
          quiz: u.dataValues.quiz,
        };

        return usu;
      });

      return res.status(200).json(usuarios);
    }
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};

const getUserById = async (req, res) => {
  const { id_user } = req.params;
  if (!id_user) {
    return res.status(501).json({ message: "Falta informacion" });
  }
  try {
    const userDb = await User.findOne({
      where: {
        id_user,
      },

      include: [
        {
          association: "dailies",
          through: {
            attributes: [],
          },
        },
        {
          association: "logins",
          through: {
            attributes: [],
          },
        },
        {
          model: Quiz,
        },
        {
          model: Encrypted,
        },
      ],
    });
    if (userDb) {
      const textNombre = {
        encryptedData: userDb.dataValues.encrypted.dataValues.encryptedDataName,
        iv: userDb.dataValues.encrypted.dataValues.ivName,
      };
      const textApellido = {
        encryptedData:
          userDb.dataValues.encrypted.dataValues.encryptedDataLastname,
        iv: userDb.dataValues.encrypted.dataValues.ivLastname,
      };
      const textDate = {
        encryptedData:
          userDb.dataValues.encrypted.dataValues.encryptedDataDatebirth,
        iv: userDb.dataValues.encrypted.dataValues.ivDatebirth,
      };
      const textCountry = {
        encryptedData:
          userDb.dataValues.encrypted.dataValues.encryptedDataCountry,
        iv: userDb.dataValues.encrypted.dataValues.ivCountry,
      };
      const textRegion = {
        encryptedData:
          userDb.dataValues.encrypted.dataValues.encryptedDataRegion,
        iv: userDb.dataValues.encrypted.dataValues.ivRegion,
      };
      const textGender = {
        encryptedData:
          userDb.dataValues.encrypted.dataValues.encryptedDataGender,
        iv: userDb.dataValues.encrypted.dataValues.ivGender,
      };

      const nombre = decrypt(textNombre);
      const apellido = decrypt(textApellido);
      const date = decrypt(textDate);
      const countryy = decrypt(textCountry);
      const regionn = decrypt(textRegion);
      const genderr = decrypt(textGender);

      const usu = {
        id_user: userDb.dataValues.id_user,
        name: nombre,
        lastname: apellido,
        email: userDb.dataValues.email,
        date_birth: date,
        country: countryy,
        region: regionn,
        gender: genderr,
        relationship: userDb.dataValues.relationship,
        ocupation: userDb.dataValues.ocupation,
        unemployed: userDb.dataValues.unemployed,
        user_type: userDb.dataValues.user_type,
        status: userDb.dataValues.status,
        terminos: userDb.dataValues.terminos,
        progress: userDb.dataValues.progress,
        firstLogin: userDb.dataValues.firstLogin,
        createdAt: userDb.dataValues.createdAt,
        updatedAt: userDb.dataValues.updatedAt,
        dailies: userDb.dataValues.dailies,
        logins: userDb.dataValues.logins,
        quiz: userDb.dataValues.quiz,
      };
      return res.status(200).json(usu);
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};
const dailyProgress = async (req, res) => {
  const { id_user } = req.body;
  if (!id_user) {
    return res.status(500).json({ message: "Falta el id" });
  }
  try {
    const user = await User.findByPk(id_user, {
      include: [
        {
          association: "dailies",
          through: {
            attributes: [],
          },
        },
        {
          model: Encrypted,
        },
      ],
    });
    if (!user) {
      return res.status(500).json({ message: "Este usuario no existe" });
    }
    if (user.dataValues.dailies.length === 0) {
      return res.status(500).json({ message: "No hay dailies todavia" });
    }
    let primerDaily;
    if (user.dataValues.dailies[0].dataValues.respuesta === "muy mal") {
      primerDaily = -2;
    }
    if (user.dataValues.dailies[0].dataValues.respuesta === "mal") {
      primerDaily = -1;
    }
    if (user.dataValues.dailies[0].dataValues.respuesta === "regular") {
      primerDaily = 0;
    }
    if (user.dataValues.dailies[0].dataValues.respuesta === "bien") {
      primerDaily = 1;
    }
    if (user.dataValues.dailies[0].dataValues.respuesta === "muy bien") {
      primerDaily = 2;
    }

    const primerValor = user.dataValues.dailies.shift();

    if (user.dataValues.dailies.length === 0) {
      return res.status(200).json({
        message: "Solo hay una daily",
        data: primerDaily,
        daily: primerValor,
      });
    }

    const userDaily = user.dataValues.dailies.map((el) => {
      let dailys;
      if (primerDaily === -2) {
        if (el.dataValues.respuesta === "muy mal") {
          dailys = 0;
        }
        if (el.dataValues.respuesta === "mal") {
          dailys = 1;
        }
        if (el.dataValues.respuesta === "regular") {
          dailys = 2;
        }
        if (el.dataValues.respuesta === "bien") {
          dailys = 3;
        }
        if (el.dataValues.respuesta === "muy bien") {
          dailys = 4;
        }
      }
      if (primerDaily === -1) {
        if (el.dataValues.respuesta === "muy mal") {
          dailys = -1;
        }
        if (el.dataValues.respuesta === "mal") {
          dailys = 0;
        }
        if (el.dataValues.respuesta === "regular") {
          dailys = 1;
        }
        if (el.dataValues.respuesta === "bien") {
          dailys = 2;
        }
        if (el.dataValues.respuesta === "muy bien") {
          dailys = 3;
        }
      }
      if (primerDaily === 0) {
        if (el.dataValues.respuesta === "muy mal") {
          dailys = -2;
        }
        if (el.dataValues.respuesta === "mal") {
          dailys = -1;
        }
        if (el.dataValues.respuesta === "regular") {
          dailys = 0;
        }
        if (el.dataValues.respuesta === "bien") {
          dailys = 1;
        }
        if (el.dataValues.respuesta === "muy bien") {
          dailys = 2;
        }
      }
      if (primerDaily === 1) {
        if (el.dataValues.respuesta === "muy mal") {
          dailys = -3;
        }
        if (el.dataValues.respuesta === "mal") {
          dailys = -2;
        }
        if (el.dataValues.respuesta === "regular") {
          dailys = -1;
        }
        if (el.dataValues.respuesta === "bien") {
          dailys = 0;
        }
        if (el.dataValues.respuesta === "muy bien") {
          dailys = 1;
        }
      }
      if (primerDaily === 2) {
        if (el.dataValues.respuesta === "muy mal") {
          dailys = -4;
        }
        if (el.dataValues.respuesta === "mal") {
          dailys = -3;
        }
        if (el.dataValues.respuesta === "regular") {
          dailys = -2;
        }
        if (el.dataValues.respuesta === "bien") {
          dailys = -1;
        }
        if (el.dataValues.respuesta === "muy bien") {
          dailys = 0;
        }
      }
      return dailys;
    });

    function sumar_array(array_numeros) {
      var suma = 0;

      array_numeros.forEach(function (numero) {
        suma += numero;
      });

      return suma;
    }
    const resultado = sumar_array(userDaily);
    console.log(userDaily);
    console.log(resultado);
    return res.status(200).json({
      primerDaily: primerDaily,
      resultadoDailies: resultado,
      dailies: userDaily,
    });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};
const getNewsletter = async (req, res) => {
  const newsletter = await Newsletter.findAll();
  if (!newsletter || newsletter.length === 0) {
    return res.status(500).json({ message: "El newsletter esta vacio" });
  }
  return res.status(200).json(newsletter);
};
const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Se requiere un usuario o contraseña valido",
    });
  }

  try {
    const userAdmin = await User.findOne({
      where: {
        email: email,
      },
    });
    if (!userAdmin) {
      return res.status(400).json({
        message: "Este usuario no existe",
      });
    }
    if (userAdmin.dataValues.user_type !== "ADMIN") {
      return res.status(402).json({
        message: "Este usuario no es administrador",
      });
    }
    const passwordfinal = bcrypt.compareSync(
      password,
      userAdmin.dataValues.password
    );

    if (!passwordfinal) {
      return res.status(400).json({
        message: "Contraseña incorrecta",
      });
    }
    const payload = {
      user: {
        id: userAdmin.dataValues.id_user,
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
        });
      }
    );
  } catch (error) {
    return res.status(500).json({
      error: error,
    });
  }
};
module.exports = {
  getAllUsers,
  getUserById,
  dailyProgress,
  getNewsletter,
  loginAdmin,
};
