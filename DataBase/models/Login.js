const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const login = {
    id_login: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
  };

  const config = {
    tableName: "login",
    timestamps: true,
    paranoid: true,
  };

  const Login = sequelize.define("login", login, config);

  Login.associate = (models) => {
    Login.belongsToMany(models.User, {
      through: "login_by_user",
      timestamps: false,
    });
  };

  return Login;
};
