const { Quiz, User } = require("../DataBase/index.js");

const postQuiz = async (req, res) => {
  const {
    respuesta0,
    respuesta1,
    respuesta2,
    respuesta3,
    respuesta4,
    respuesta5,
    respuesta6,
    respuesta7,
  } = req.body;
  const { id_user } = req.session;
  if (
    respuesta0 === undefined ||
    respuesta1 === undefined ||
    respuesta2 === undefined ||
    respuesta3 === undefined ||
    respuesta4 === undefined ||
    respuesta5 === undefined ||
    respuesta6 === undefined ||
    respuesta7 === undefined ||
    !id_user
  ) {
    return res.status(403).json({ message: "Falta informacion" });
  }

  const user = await User.findByPk(id_user);
  if (!user) {
    return res.status(403).json({ message: "Usuario inexistente" });
  }
  const nuevaQuiz = await Quiz.create({
    respuesta0,
    respuesta1,
    respuesta2,
    respuesta3,
    respuesta4,
    respuesta5,
    respuesta6,
    respuesta7,
    id_user,
  });

  if (nuevaQuiz) {
    return res
      .status(200)
      .json({ message: "Quiz creado correctamente", data: nuevaQuiz });
  } else {
    return res.status(500).json({ message: "Error al crear el quiz" });
  }
};

module.exports = {
  postQuiz,
};
