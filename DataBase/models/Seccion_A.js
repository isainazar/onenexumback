const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const seccion_a = {
    id_seccion_a: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    completed:{
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
    tableName: "seccion_a",
    timestamps: true,
    paranoid: true,
    underscored:true
  };

  const Seccion_A = sequelize.define("secciona", seccion_a, config);

  Seccion_A.associate = (models) => {
    Seccion_A.belongsTo(models.User, {
      sourceKey: "id",
      foreignKey: "id_user",
    });
  }; 

  return Seccion_A;
};
