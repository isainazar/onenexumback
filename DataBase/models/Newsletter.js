const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const newsletter = {
    id_newsletter: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    checkboxs: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
    },
  };

  const config = {
    tableName: "newsletter",
    timestamps: true,
    paranoid: true,
  };

  const Newsletter = sequelize.define("newsletter", newsletter, config);

  return Newsletter;
};
