const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const checkeo = {
    id_checkeo: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    question_1: {
      type: DataTypes.ENUM("muy mal", "mal", "regular", "bien", "muy bien"),
      allowNull: false,
    },
    question_2: {
      type: DataTypes.ENUM("muy mal", "mal", "regular", "bien", "muy bien"),
      allowNull: true,
    },
  };

  const config = {
    tableName: "checkeo",
    timestamps: true,
    paranoid: true,
  };

  const Checkeo = sequelize.define("checkeo", checkeo, config);

  Checkeo.associate = (models) => {
    Checkeo.belongsTo(models.User, {
      sourceKey: "id_checkeo",
      foreignKey: "id_user",
    });
  };

  return Checkeo;
};
