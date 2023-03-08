const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const trabajo = {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    trabajo_y_rol: {
      type: DataTypes.ENUM(
        "si, empleado",
        "si, autónomo",
        "si, empleador",
        "no"
      ),
      allowNull: true,
    },
    disfrutas_trabajo: {
      type: DataTypes.ENUM("si", "no", "un poco"),
      allowNull: true,
    },
    cumples_objetivos_y_obligaciones: {
      type: DataTypes.ENUM("si", "no", "algunas veces"),
      allowNull: true,
    },
    buen_ambiente_laboral: {
      type: DataTypes.ENUM("si", "no", "en ocasiones"),
      allowNull: true,
    },
    priorizar_trabajo_sobre_vida: {
      type: DataTypes.ENUM("si", "no", "en ocasiones"),
      allowNull: true,
    },
    first_time_completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  };

  const config = {
    tableName: "trabajo",
    timestamps: true,
    paranoid: true,
  };

  const Trabajo = sequelize.define("trabajo", trabajo, config);

  Trabajo.associate = (models) => {
    Trabajo.belongsTo(models.User, {
      sourceKey: "id",
      foreignKey: "id_user",
    });
  };

  return Trabajo;
};
