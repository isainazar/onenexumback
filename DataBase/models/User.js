const { hashSync } = require("bcrypt");
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const user = {
    id_user: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
      set(value) {
        this.setDataValue("password", hashSync(value, 10));
      },
      get() {},
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date_birth: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    region: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    gender: {
      type: DataTypes.ENUM("Masculino", "Femenino", "Binario", "Otro"),
      allowNull: true,
    },
    relationship: {
      type: DataTypes.ENUM(
        "Soltero",
        "Saliendo",
        "En una relacion",
        "Casado",
        "Otro"
      ),
      allowNull: true,
    },
    ocupation: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    unemployed: {
      type: DataTypes.ENUM("Yes", "No"),
      allowNull: true,
    },
    user_type: {
      type: DataTypes.ENUM("1", "2", "ADMIN"),
      allowNull: true,
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    progress: {
      type: DataTypes.STRING,
      defaultValue: "0%",
    },
    /*   provider: {
      type: DataTypes.STRING,
    },
    providerId: {
      type: DataTypes.STRING,
    }, */
  };

  const config = {
    tableName: "user",
    timestamps: true,
    paranoid: true,
  };

  const User = sequelize.define("user", user, config);

  User.associate = (models) => {
    User.hasOne(models.Quiz, {
      sourceKey: "id_user",
      foreignKey: "id_user",
    });
    User.belongsToMany(models.Daily, {
      through: "daily_by_user",
      timestamps: false,
    });
    User.hasOne(models.Checkeo, {
      sourceKey: "id_user",
      foreignKey: "id_checkeo",
    });
    User.hasOne(models.FeedbackA, {
      sourceKey: "id_user",
      foreignKey: "id_feedbackA",
    });
  };

  return User;
};
