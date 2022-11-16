const { User } = require("../DataBase/index.js");

const progress = async (req, res) => {
  const { page } = req.body;
  const { user } = req.session;
  console.log(req.session);
  if (!user.id_user || !page) {
    return res.status(500).json({ message: "Se requieren todos los campos" });
  }
  const userr = await User.findByPk(user.id_user);
  if (!userr) {
    return res.status(401).json({ message: "No existe este usuario" });
  }
  if (Number.isInteger(page)) {
    if (page > pages) {
      return res.status(401).json({
        message: "La pagina recibida no existe",
      });
    }
    const pages = 23;
    const resultado = Math.round((page * 100) / pages);
    if (user.progress > resultado) {
      return res.status(400).json({
        message: "No se actualizo el progreso porque actualmente es mayor",
      });
    }

    const nuevoUsuario = await User.update(
      {
        progress: resultado,
      },
      {
        where: {
          id_user: user.id_user,
        },
      }
    );
    if (nuevoUsuario) {
      req.session.user.progress = resultado;
      return res.status(200).json({ message: "Progeso actualizado con exito" });
    } else {
      return res
        .status(404)
        .json({ message: "Progreso no se ha podido actualizar" });
    }
  } else {
    return res
      .status(404)
      .json({ message: "El numero de pagina no es entero" });
  }
};

module.exports = {
  progress,
};
