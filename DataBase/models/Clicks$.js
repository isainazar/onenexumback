const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const clicks$ = {
    id_clicks: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
  };

  const config = {
    tableName: "clicks$",
    timestamps: true,
    paranoid: true,
  };

  const Clicks$ = sequelize.define("clicks$", clicks$, config);

  return Clicks$;
};
