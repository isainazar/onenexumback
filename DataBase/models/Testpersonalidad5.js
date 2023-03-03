const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const test_personalidad_5 = {
    id_test: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    result: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  };

  const config = {
    tableName: "testpersonalidad5",
    timestamps: true,
    paranoid: true,
  };

  const Testpersonalidad5 = sequelize.define(
    "testpersonalidad5",
    test_personalidad_5,
    config
  );

  Testpersonalidad5.associate = (models) => {
    Testpersonalidad5.belongsTo(models.User, {
      sourceKey: "id",
      foreignKey: "id_user",
    });
  };

  return Testpersonalidad5;
};
