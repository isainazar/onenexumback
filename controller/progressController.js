const { User } = require("../DataBase/index.js");

const progress = async (req, res) => {
  console.log(req.session);

  const { page, id_user } = req.body;
  if (!id_user || !page || progress === undefined) {
    return res.status(500).json({ message: "Se requieren todos los campos" });
  }
  const user = await User.findByPk(id_user);
  if (Number.isInteger(page)) {
    const pages = 23;
    const resultado = Math.round((page * 100) / pages);
    if (user.dataValues.progress > resultado) {
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
          id_user,
        },
      }
    );
    if (nuevoUsuario) {
      /* req.session.progress = resultado; */
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
