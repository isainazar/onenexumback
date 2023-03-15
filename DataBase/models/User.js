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
      allowNull: false,
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
      type: DataTypes.STRING,
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
      type: DataTypes.STRING,
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
    terminos: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    progress: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    firstLogin: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    idPayment: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mail_accepted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    provider: {
      type: DataTypes.STRING,
    },
    providerId: {
      type: DataTypes.STRING,
    },
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
    User.hasOne(models.Testpersonalidad1, {
      sourceKey: "id_user",
      foreignKey: "id_user",
    });
    User.hasOne(models.Testpersonalidad2, {
      sourceKey: "id_user",
      foreignKey: "id_user",
    });
    User.hasOne(models.Testpersonalidad3, {
      sourceKey: "id_user",
      foreignKey: "id_user",
    });
    User.hasOne(models.Testpersonalidad4, {
      sourceKey: "id_user",
      foreignKey: "id_user",
    });
    User.hasOne(models.Testpersonalidad5, {
      sourceKey: "id_user",
      foreignKey: "id_user",
    });
    User.hasOne(models.Secciona, {
      sourceKey: "id_user",
      foreignKey: "id_user",
    });
    User.hasOne(models.Seccionb, {
      sourceKey: "id_user",
      foreignKey: "id_user",
    });
    User.hasOne(models.Valoracionsecciona, {
      sourceKey: "id_user",
      foreignKey: "id_user",
    });
    User.hasOne(models.Valoracionseccionb, {
      sourceKey: "id_user",
      foreignKey: "id_user",
    });
    User.hasOne(models.Gustoseintereses, {
      sourceKey: "id_user",
      foreignKey: "id_user",
    });
    User.hasOne(models.Vidayrelaciones, {
      sourceKey: "id_user",
      foreignKey: "id_user",
    });
    User.hasOne(models.Trabajo, {
      sourceKey: "id_user",
      foreignKey: "id_user",
    });
    User.belongsToMany(models.Login, {
      through: "login_by_user",
      timestamps: false,
    });
    User.belongsToMany(models.Daily, {
      through: "daily_by_user",
      timestamps: false,
    });
    User.hasMany(models.Diariovirtual, {
      foreignKey: "id_user",
      as: "posts"
    });
    User.hasMany(models.Favorito, {
      foreignKey: "id_user",
      as: "favs"
    });
  };

  return User;
};
