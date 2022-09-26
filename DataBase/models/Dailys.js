const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const dayly = {
    id_dayly: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    question: {
      type: DataTypes.ENUM("muy mal", "mal", "regular", "bien", "muy bien"),
      allowNull: false,
    },
    type_dayly: {
      type: DataTypes.ENUM("1", "2", "3"),
      allowNull: false,
    },
  };

  const config = {
    tableName: "dayly",
    timestamps: true,
    paranoid: true,
  };

  const Dayly = sequelize.define("dayly", dayly, config);

  Dayly.associate = (models) => {
    Dayly.belongsToMany(models.User, {
      through: "dayly_by_user",
      timestamps: false,
    });
  };

  return Dayly;
};
