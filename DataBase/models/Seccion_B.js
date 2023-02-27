const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const seccion_b = {
    id_seccion_b: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    exercise1_started: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    exercise1_completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    exercise2_started: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    exercise2_completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    exercise3_started: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    exercise3_completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    bonus_started: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    bonus_completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  };

  const config = {
    tableName: "seccion_b",
    timestamps: true,
    paranoid: true,
  };

  const Seccion_B = sequelize.define("seccionb", seccion_b, config);

  Seccion_B.associate = (models) => {
    Seccion_B.belongsTo(models.User, {
      sourceKey: "id",
      foreignKey: "id_user",
    });
  };

  return Seccion_B;
};
