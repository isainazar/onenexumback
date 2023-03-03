const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const test_personalidad_1 = {
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
    tableName: "testpersonalidad1",
    timestamps: true,
    paranoid: true,
  };

  const Testpersonalidad1 = sequelize.define(
    "testpersonalidad1",
    test_personalidad_1,
    config
  );

  Testpersonalidad1.associate = (models) => {
    Testpersonalidad1.belongsTo(models.User, {
      sourceKey: "id",
      foreignKey: "id_user",
    });
  };

  return Testpersonalidad1;
};
