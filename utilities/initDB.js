const user = require("../JSON/user.json");
const { User } = require("../DataBase/index");

module.exports = async () => {
  console.log("Inicializando DDBB..."); // eslint-disable-line no-console

  try {
    await User.bulkCreate(user, {
      validate: true,
    });
    console.log("- Usuario cargado en la DDBB"); // eslint-disable-line no-console
  } catch (err) {
    console.log(`Tipo de error: ${err}`); // eslint-disable-line no-console
    console.log("No se ha podido cargar el usuario"); // eslint-disable-line no-console
  }
};
