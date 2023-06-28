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
    id_user,
  } = req.body;
  if (
    respuesta0 === null ||
    respuesta1 === null ||
    respuesta2 === null ||
    respuesta3 === null ||
    respuesta4 === null ||
    respuesta5 === null ||
    respuesta6 === null ||
    !id_user
  ) {
    const user = await User.findByPk(id_user);
    if (user){
      await user.destroy();
      return res.status(404).json({ message: "Ocurrió un error en el quiz, por favor realízalo nuevamente" });
    }
    return res.status(500).json({message: "Ocurrió un error inesperado"});
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
