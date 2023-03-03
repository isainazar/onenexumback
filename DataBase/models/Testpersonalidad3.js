const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const test_personalidad_3 = {
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
    tableName: "testpersonalidad3",
    timestamps: true,
    paranoid: true,
  };

  const Testpersonalidad3 = sequelize.define(
    "testpersonalidad3",
    test_personalidad_3,
    config
  );

  Testpersonalidad3.associate = (models) => {
    Testpersonalidad3.belongsTo(models.User, {
      sourceKey: "id",
      foreignKey: "id_user",
    });
  };

  return Testpersonalidad3;
};
