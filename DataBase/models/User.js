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
      allowNull: true,
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
      unique: true,
      validate: {
        isEmail: true,
      },
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
      type: DataTypes.ENUM("male", "female", "binary", "other"),
      allowNull: true,
    },
    relationship: {
      type: DataTypes.ENUM("single", "dating", "relationship", "married"),
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
      type: DataTypes.ENUM("1", "2"),
      allowNull: true,
    },
    provider: {
      type: DataTypes.STRING,
    },
    providerId: {
      type: DataTypes.STRING,
      unique: true,
    },
  };

  const config = {
    tableName: "user",
    timestamps: true,
    paranoid: true,
  };

  const User = sequelize.define("user", user, config);

  User.associate = (models) => {
    User.belongsToMany(models.Dayly, {
      through: "dayly_by_user",
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
