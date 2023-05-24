const {
  User,
  Daily,
  Gustoseintereses,
  Trabajo,
  Vidayrelaciones,
  Quiz,
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
      where: {
        user_type: ["1", "2"],
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
        }/* ,
        {
          model: Quiz,
        },

        {
          association: "diariovirtual",
          through: {
            attributes: [],
          },
        },
        {
          model: Trabajo,
        }, */
        
      ], 
    });
    if (users.length !== 0) {
      const usuarios = users.map((u) => {
        let date;
        const nombre = decrypt(u.name);
        const apellido = decrypt(u.lastname);
        if (u.dataValues.date_birth) {
          date = decrypt(u.dataValues.date_birth);
        }
        // const countryy = decrypt(u.dataValues.country);
        // const regionn = decrypt(u.dataValues.region);
        // const genderr = decrypt(u.dataValues.gender);

        const usu = {
          id_user: u.dataValues.id_user,
          name: nombre,
          lastname: apellido,
          email: u.dataValues.email,
          date_birth: date !== undefined ? date : null,
          // country: countryy,
          // region: regionn,
          //  gender: genderr,
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
          trabajo: u.dataValues.trabajo,
          vidayrelaciones: u.dataValues.vidayrelaciones,
          gustoseintereses: u.dataValues.gustoseintereses,
          diariovirtual: u.dataValues.diariovirtual,
        };

        return usu;
      });

      return res.status(200).json(usuarios);
    } else {
      return res.status(204).json({ message: "No hay usuarios en la db" });
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
      /*   {
          association: "diariovirtual",
          through: {
            attributes: [],
          },
        }, */
        {
          model: Trabajo,
        },
        {
          model: Gustoseintereses,
        },
       /*  {
          model: Vidayrelaciones,
        }, */
      ],
    });
    if (userDb) {
      const nombre = decrypt(userDb.dataValues.name);
      const apellido = decrypt(userDb.dataValues.lastname);
      //  const date = decrypt(userDb.dataValues.date_birth);
      //  const countryy = decrypt(userDb.dataValues.country);
      //  const regionn = decrypt(userDb.dataValues.region);
      //   const genderr = decrypt(userDb.dataValues.gender);
      const usu = {
        id_user: userDb.dataValues.id_user,
        name: nombre,
        lastname: apellido,
        email: userDb.dataValues.email,
        //  date_birth: date,
        //  country: countryy,
        //   region: regionn,
        //    gender: genderr,
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
        trabajo: userDb.dataValues.trabajo,
     //   vidayrelaciones: userDb.dataValues.vidayrelaciones,
        gustoseintereses: userDb.dataValues.gustoseintereses,
        diariovirtual: userDb.dataValues.diariovirtual,
      };
      console.log(usu.logins)
      return res.status(200).json(usu);
    } else {
      return res.status(204).json({ message: "User not found" });
    }
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
  getNewsletter,
  loginAdmin,
};
