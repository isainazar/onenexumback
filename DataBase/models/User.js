const { DataTypes } = require("sequelize");
const { hashSync } = require("bcrypt");

module.exports = (sequelize) => {
  const user = {
    id_user: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        this.setDataValue("password", hashSync(value, 10));
      },
      get() {},
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
  };

  const config = {
    tableName: "user",
    timestamps: true,
    paranoid: true,
  };

  const User = sequelize.define("user", user, config);

  return User;
};
