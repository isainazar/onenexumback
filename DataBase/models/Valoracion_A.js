const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const valoracion_seccion_a = {
    valoracion_exercise_1: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    valoracion_exercise_2: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      allowNull: true,
    },
    valoracion_exercise_3: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      allowNull: true,
    },
    valoracion_bonus: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      allowNull: true,
    },
  };

  const config = {
    tableName: "valoracionsecciona",
    timestamps: true,
    paranoid: true,
  };

  const Valoracion_seccion_A = sequelize.define(
    "valoracionsecciona",
    valoracion_seccion_a,
    config
  );

  Valoracion_seccion_A.associate = (models) => {
    Valoracion_seccion_A.belongsTo(models.User, {
      sourceKey: "id",
      foreignKey: "id_user",
    });
  };

  return Valoracion_seccion_A;
};
