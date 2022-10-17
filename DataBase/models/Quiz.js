const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const quiz = {
    id_quiz: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    respuesta1: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    respuesta2: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    respuesta3: {
      type: DataTypes.ARRAY(DataTypes.BOOLEAN),
      allowNull: false,
    },
    respuesta4: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    respuesta5: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    respuesta6: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    respuesta7: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  };

  const config = {
    tableName: "quiz",
    timestamps: true,
    paranoid: true,
  };

  const Quiz = sequelize.define("quiz", quiz, config);

  Quiz.associate = (models) => {
    Quiz.belongsTo(models.User, {
      sourceKey: "id",
      foreignKey: "id_user",
    });
  };

  return Quiz;
};
