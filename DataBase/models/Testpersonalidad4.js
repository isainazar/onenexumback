const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const test_personalidad_4 = {
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
    tableName: "testpersonalidad4",
    timestamps: true,
    paranoid: true,
  };

  const Testpersonalidad4 = sequelize.define(
    "testpersonalidad4",
    test_personalidad_4,
    config
  );

  Testpersonalidad4.associate = (models) => {
    Testpersonalidad4.belongsTo(models.User, {
      sourceKey: "id",
      foreignKey: "id_user",
    });
  };

  return Testpersonalidad4;
};
