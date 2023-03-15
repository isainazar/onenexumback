const { User, Favorito } = require("../DataBase/index.js");

const postFav = async (req, res) => {
  const { user, url } = req.body;
  if (!url || !user) {
    return res.status(403).json({ message: "Falta informacion" });
  }
  const usuario = await User.findByPk(user);
  if (!usuario) {
    return res.status(403).json({ message: "Usuario inexistente" });
  }

  //verificar si ya existe la url para no duplicarla

/*   const favs = await User.findByPk(user, {
    include: [
      {
        model: Favorito,
        through: {
          attributes: [],
        },
      },
    ],
  });
  if (favs.dataValues.favoritos) {
    const favoritosActuales = favs.dataValues.favoritos;
    for (const favorito of favoritosActuales) {
      if (favorito.url === url) {
        return res
          .status(200)
          .json({ message: "Ya se había agregado el favorito" });
      }
    }
  } */

  //si no existe, la crea

  try {
    const newFav = await Favorito.create({ id_user: usuario.dataValues.id_user, url });
   
    if (newFav) {
      return res.status(200).json({
        message: "Favorito agregado",
        data: newFav,
      });
    } else {
      return res.status(500).json({ message: "Error al agregarfavorito" });
    }
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};
//obtener todos los favs de un usuario
const getFavs = async (req, res) => {
  const { user } = req.params;
  if (!user) {
    return res.status(403).json({ message: "Falta informacion" });
  }
  try {
    const favs = await Favorito.findAll({
      where:{
        id_user: user,
      }
    });
    return res.status(200).json({ message: favs || [] });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

const getAllFavs = async (res) => {
  try {
    const allFavs = await Favorito.findAll();
    if (!allFavs) {
      return res.status(404).json({ message: "No se encontraron favoritos" });
    }
    return res.status(200).json({ message: allFavs });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

module.exports = {
  postFav,
  getFavs,
  getAllFavs,
};
