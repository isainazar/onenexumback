const { User } = require("../DataBase/index.js");

const progress5 = async (req, res) => {
  console.log(req.session);
  const { id_user } = req.session;
  const usuario = await User.findByPk(id_user);
  if (usuario.dataValues.progress > 5) {
    req.session.progress = `${usuario.dataValues.progress}%`;
    return res
      .status(400)
      .json({ message: "El progreso actual es mayor al 5%" });
  }
  const usuarioCambiado = await User.update(
    {
      progress: 5,
    },
    {
      where: {
        id_user,
      },
    }
  );
  if (usuarioCambiado) {
    req.session.progress = "5%";
    return res.status(200).json({ message: "Usuario cambiado correctamente" });
  } else {
    return res
      .status(404)
      .json({ message: "Error al intentar cambiar el usuario" });
  }
};
const progress7 = async (req, res) => {
  console.log(req.session);
  const { id_user } = req.session;
  const usuario = await User.findByPk(id_user);
  if (usuario.dataValues.progress > 7) {
    req.session.progress = `${usuario.dataValues.progress}%`;
    return res
      .status(400)
      .json({ message: "El progreso actual es mayor al 7%" });
  }
  const usuarioCambiado = await User.update(
    {
      progress: 7,
    },
    {
      where: {
        id_user,
      },
    }
  );
  if (usuarioCambiado) {
    req.session.progress = "7%";
    return res.status(200).json({ message: "Usuario cambiado correctamente" });
  } else {
    return res
      .status(404)
      .json({ message: "Error al intentar cambiar el usuario" });
  }
};
const progress10 = async (req, res) => {
  console.log(req.session);
  const { id_user } = req.session;
  const usuario = await User.findByPk(id_user);
  if (usuario.dataValues.progress > 10) {
    req.session.progress = `${usuario.dataValues.progress}%`;
    return res
      .status(400)
      .json({ message: "El progreso actual es mayor al 10%" });
  }
  const usuarioCambiado = await User.update(
    {
      progress: 10,
    },
    {
      where: {
        id_user,
      },
    }
  );
  if (usuarioCambiado) {
    req.session.progress = "10%";
    return res.status(200).json({ message: "Usuario cambiado correctamente" });
  } else {
    return res
      .status(404)
      .json({ message: "Error al intentar cambiar el usuario" });
  }
};

module.exports = {
  progress5,
  progress7,
  progress10,
};
