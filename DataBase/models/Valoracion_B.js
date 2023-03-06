const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const valoracion_seccion_b = {
    valoracion_exercise_1: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    valoracion_exercise_2: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    valoracion_exercise_3: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    valoracion_bonus: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
  };

  const config = {
    tableName: "valoracionseccionb",
    timestamps: true,
    paranoid: true,
  };

  const Valoracion_seccion_B = sequelize.define(
    "valoracionseccionb",
    valoracion_seccion_b,
    config
  );

  Valoracion_seccion_B.associate = (models) => {
    Valoracion_seccion_B.belongsTo(models.User, {
      sourceKey: "id",
      foreignKey: "id_user",
    });
  };

  return Valoracion_seccion_B;
};
