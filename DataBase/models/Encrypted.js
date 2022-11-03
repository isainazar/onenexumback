const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const encrypted = {
    encryptedDataName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ivName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    encryptedDataLastname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ivLastname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    encryptedDataDatebirth: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ivDatebirth: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    encryptedDataCountry: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ivCountry: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    encryptedDataRegion: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ivRegion: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    encryptedDataGender: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ivGender: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  };

  const config = {
    tableName: "encrypted",
    timestamps: true,
    paranoid: true,
  };

  const Encrypted = sequelize.define("encrypted", encrypted, config);

  Encrypted.associate = (models) => {
    Encrypted.belongsTo(models.User, {
      sourceKey: "id",
      foreignKey: "id_user",
    });
  };

  return Encrypted;
};
