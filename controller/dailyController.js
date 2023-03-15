const { User, Daily } = require("../DataBase/index.js");
const toDate = require("../utilities/fecha");

function getValuePercentages(arr) {
  // Use the reduce() method to count the number of times each value appears in the array
  const counts = arr.reduce((acc, elem) => {
    if (elem in acc) {
      acc[elem]++;
    } else {
      acc[elem] = 1;
    }
    return acc;
  }, {});

  // Use the filter() method to count the total number of elements in the array
  const total = arr.filter((elem) => elem in counts).length;

  // Calculate the percentage that each value occupies in the array
  const percentages = {};
  Object.keys(counts).forEach((key) => {
    percentages[key] = (counts[key] / total) * 100;
  });

  return percentages;
}

function removeDuplicates(arr) {
  // Create a new array to store the unique elements
  const unique = [];

  // Iterate over the array and add each element to the set only if it is not already present in the set
  for (const elem of arr) {
    if (!unique.includes(elem)) {
      unique.push(elem);
    }
  }

  return unique;
}

const postDaily = async (req, res) => {
  const { primary, secondary } = req.body;
  const { user } = req.body;
  if (!primary || !secondary || !user) {
    return res.status(403).json({ message: "Falta informacion" });
  }

  const userr = await User.findByPk(user);
  if (!userr) {
    return res.status(403).json({ message: "Usuario inexistente" });
  }
  try {
    const nuevaDaily = await Daily.create({
      primary,
      secondary,
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
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

const getDailyConfirm = async (req, res) => {
  const { user } = req.params;
  if (!user) {
    return res.status(403).json({ message: "Falta informacion" });
  }
  const usuario = await User.findByPk(user);
  if (!usuario) {
    return res.status(403).json({ message: "Usuario inexistente" });
  }
  
  try {
    const today = toDate(new Date());
    const daily = await Daily.findAll({
      include: [
        {
          model: User,
          where: { id_user: usuario.dataValues.id_user },
        },
      ],
    });
  
    if(daily.length===0){
      return res.status(200).json({message: false});
    }
    return res
      .status(200)
      .json({ message: toDate(daily[daily.length - 1].createdAt) === today });
  } catch (err) {
    return res.status(500).json({ message: err });
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
const dailyTotal = async (req, res) => {
  const dailys = await Daily.findAll();
  if (!dailys || dailys.length === 0) {
    return res.status(500).json({ message: "No se encontraron dailys" });
  }
  console.log(dailys);
  const dailyMuyMal = dailys.filter(
    (t) => t.dataValues.respuesta === "muy mal"
  );
  const dailyMal = dailys.filter((t) => t.dataValues.respuesta === "mal");
  const dailyRegular = dailys.filter(
    (t) => t.dataValues.respuesta === "regular"
  );
  const dailyBien = dailys.filter((t) => t.dataValues.respuesta === "bien");
  const dailyMuyBien = dailys.filter(
    (t) => t.dataValues.respuesta === "muy bien"
  );
  const muymal = dailyMuyMal.map((el) => el.respuesta);
  const mal = dailyMal.map((el) => el.respuesta);
  const regular = dailyRegular.map((el) => el.respuesta);
  const bien = dailyBien.map((el) => el.respuesta);
  const muybien = dailyMuyBien.map((el) => el.respuesta);

  const arrayDeDailys = [muymal, mal, regular, bien, muybien];
  const sortedArrays = arrayDeDailys
    .slice()
    .sort((a, b) => b.length - a.length);
  const flatArr = sortedArrays.flat();
  const arrPosta = removeDuplicates(flatArr);
  const porcentaje = getValuePercentages(flatArr);
  return res.status(200).json({ total: arrPosta, totalPorcentaje: porcentaje });
};
module.exports = {
  postDaily,
  dailyProgress,
  dailyTotal,
  getDailyConfirm,
};
