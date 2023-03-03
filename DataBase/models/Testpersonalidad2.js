const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const test_personalidad_2 = {
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
    tableName: "testpersonalidad2",
    timestamps: true,
    paranoid: true,
  };

  const Testpersonalidad2 = sequelize.define(
    "testpersonalidad2",
    test_personalidad_2,
    config
  );

  Testpersonalidad2.associate = (models) => {
    Testpersonalidad2.belongsTo(models.User, {
      sourceKey: "id",
      foreignKey: "id_user",
    });
  };

  return Testpersonalidad2;
};
