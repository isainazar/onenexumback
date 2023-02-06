const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const gustoseintereses = {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    generos_musica: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    arte_y_diseño: {
      type: DataTypes.ENUM("si", "no", "algo"),
      allowNull: true,
    },
    aprecio_gusto_artistico: {
      type: DataTypes.ENUM("si", "no", "algo"),
      allowNull: true,
    },
    identificado_e_intereses: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    first_time_completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  };

  const config = {
    tableName: "gustoseintereses",
    timestamps: true,
    paranoid: true,
  };

  const Gustoseintereses = sequelize.define(
    "gustoseintereses",
    gustoseintereses,
    config
  );

  Gustoseintereses.associate = (models) => {
    Gustoseintereses.belongsTo(models.User, {
      sourceKey: "id",
      foreignKey: "id_user",
    });
  };

  return Gustoseintereses;
};
