const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const encrypted = {
    encryptedDataName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    encryptedDataLastname: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    encryptedDataDatebirth: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    encryptedDataCountry: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    encryptedDataRegion: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    encryptedDataGender: {
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
