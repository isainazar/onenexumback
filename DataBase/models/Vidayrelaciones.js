const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const vidayrelaciones = {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    acutalmente_relacion: {
      type: DataTypes.ENUM("no", "si", "es complicado"),
      allowNull: true,
    },
    descripcion_relacion: {
      type: DataTypes.ENUM("ninguna", "ambas", "fue dolorosa", "fue positiva"),
      allowNull: true,
    },
    esta_en_tus_planes_relacion: {
      type: DataTypes.ENUM(
        "otro",
        "no estoy seguro de lo que quiero",
        "no me interesa",
        "si, pero me cuesta conseguirlo",
        "si, esta en mis planes",
        "actualmente estoy en una relacion"
      ),
      allowNull: true,
    },
    relacion_familia: {
      type: DataTypes.ENUM(
        "otro",
        "es sana y positiva",
        "prefiero estar lejos de mi familia"
      ),
      allowNull: true,
    },
    tienes_amistades: {
      type: DataTypes.ENUM("me cuesta hacer amistades", "no", "si"),
      allowNull: true,
    },
    estado_civil: {
      type: DataTypes.ENUM(
        "soltero/a",
        "casado/a",
        "viudo/a",
        "en pareja",
        "divorciado/a"
      ),
      allowNull: true,
    },
    amantes_o_dos_parejas: {
      type: DataTypes.ENUM("si", "no", "es complicado"),
      allowNull: true,
    },
    relacion_con_personas: {
      type: DataTypes.ENUM("mal", "bien", "depende la persona y contexto"),
      allowNull: true,
    },
    mas_aprecia_en_personas: {
      type: DataTypes.ENUM("su lealtad", "su amistad", "su dispocision"),
      allowNull: true,
    },
    first_time_completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  };

  const config = {
    tableName: "vidayrelaciones",
    timestamps: true,
    paranoid: true,
  };

  const Vidayrelaciones = sequelize.define(
    "vidayrelaciones",
    vidayrelaciones,
    config
  );

  Vidayrelaciones.associate = (models) => {
    Vidayrelaciones.belongsTo(models.User, {
      sourceKey: "id",
      foreignKey: "id_user",
    });
  };

  return Vidayrelaciones;
};
