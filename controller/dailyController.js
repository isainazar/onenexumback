const { User, Daily } = require("../DataBase/index.js");

const postDaily = async (req, res) => {
  const { respuesta } = req.body;
  const { user } = req.session;
  if (!respuesta || !user.id_user) {
    return res.status(403).json({ message: "Falta informacion" });
  }
  if (
    respuesta === "muy mal" ||
    respuesta === "mal" ||
    respuesta === "regular" ||
    respuesta === "bien" ||
    respuesta === "muy bien"
  ) {
    const userr = await User.findByPk(user.id_user);
    if (!userr) {
      return res.status(403).json({ message: "Usuario inexistente" });
    }
    const nuevaDaily = await Daily.create({
      respuesta,
    });
    const dailyDef = await Promise.all(await nuevaDaily.addUser(userr));
    if (dailyDef) {
      return res.status(200).json({
        message: "Daily creada correctamente",
        data: dailyDef,
      });
    } else {
      return res.status(500).json({ message: "Error al crear la Daily" });
    }
  } else {
    return res.status(500).json({
      message: "Error al crear la Daily, se necesita una respuesta valida",
    });
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
module.exports = {
  postDaily,
  dailyProgress,
};
