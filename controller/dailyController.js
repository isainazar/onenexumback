const { User, Daily } = require("../DataBase/index.js");

const postDaily = async (req, res) => {
  const { id_user, respuesta } = req.body;

  if (!respuesta || !id_user) {
    return res.status(403).json({ message: "Falta informacion" });
  }
  if (
    respuesta === "muy mal" ||
    respuesta === "mal" ||
    respuesta === "regular" ||
    respuesta === "bien" ||
    respuesta === "muy bien"
  ) {
    const user = await User.findByPk(id_user);
    if (!user) {
      return res.status(403).json({ message: "Usuario inexistente" });
    }
    const nuevaDaily = await Daily.create({
      respuesta,
    });
    const dailyDef = await Promise.all(await nuevaDaily.addUser(user));
    if (dailyDef) {
      return res
        .status(200)
        .json({ message: "Daily creada correctamente", data: dailyDef });
    } else {
      return res.status(500).json({ message: "Error al crear la Daily" });
    }
  } else {
    return res.status(500).json({
      message: "Error al crear la Daily, se necesita una respuesta valida",
    });
  }
};

module.exports = {
  postDaily,
};
