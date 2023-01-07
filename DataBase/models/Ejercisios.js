const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ejercisios = {
    numero_ejercisio: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    finished: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  };

  const config = {
    tableName: "ejercisios",
    timestamps: true,
    paranoid: true,
  };

  const Ejercisios = sequelize.define("ejercisios", ejercisios, config);

  Ejercisios.associate = (models) => {
    Ejercisios.belongsToMany(models.User, {
      through: "ejercisios_by_user",
      timestamps: false,
    });
  };

  return Ejercisios;
};
