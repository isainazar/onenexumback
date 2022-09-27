const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const daily = {
    id_daily: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    respuesta: {
      type: DataTypes.ENUM("muy mal", "mal", "regular", "bien", "muy bien"),
      allowNull: false,
    },
  };

  const config = {
    tableName: "daily",
    timestamps: true,
    paranoid: true,
  };

  const Daily = sequelize.define("daily", daily, config);

  Daily.associate = (models) => {
    Daily.belongsToMany(models.User, {
      through: "daily_by_user",
      timestamps: false,
    });
  };

  return Daily;
};
