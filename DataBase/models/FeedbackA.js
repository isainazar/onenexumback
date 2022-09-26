const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const feedbackA = {
    id_feedbackA: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  };

  const config = {
    tableName: "feedbackA",
    timestamps: true,
    paranoid: true,
  };

  const FeedbackA = sequelize.define("feedbackA", feedbackA, config);

  FeedbackA.associate = (models) => {
    FeedbackA.belongsTo(models.User, {
      sourceKey: "id_feedbackA",
      foreignKey: "id_user",
    });
  };

  return FeedbackA;
};
