const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const exercise = {
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
    tableName: "exercise",
    timestamps: true,
    paranoid: true,
  };

  const Exercise = sequelize.define("exercise", exercise, config);

  Exercise.associate = (models) => {
    Exercise.belongsToMany(models.User, {
      through: "exercise_by_user",
      timestamps: false,
    });
  };

  return Exercise;
};
