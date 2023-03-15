const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const favorito = {
    id_favorito: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING(),
      allowNull: false,
    },
  
  };

  const config = {
    tableName: "favoritos",
    timestamps: true,
    paranoid: true,
  };

  const Favorito = sequelize.define("favorito", favorito, config);

  Favorito.associate = (models) => {
    Favorito.belongsTo(models.User, {
      foreingKey: "id_user"
    });
  };

  return Favorito;
};