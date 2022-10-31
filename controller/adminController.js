const { User, Daily, Quiz } = require("../DataBase/index.js");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: { status: true },
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
      ],
    });
    if (users.length !== 0) {
      return res.status(200).json(users);
    }
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};

const getUserById = async (req, res) => {
  try {
    const id_user = req.body.id_user;
    if (!id_user) {
      return res.status(501).json({ message: "Falta informacion" });
    }
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
      ],
    });
    if (userDb) {
      return res.status(200).json(userDb);
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (e) {
    return res
      .status(500)
      .json({ message: "Error al cone ctarse a la base de datos" });
  }
};

module.exports = { getAllUsers, getUserById };
