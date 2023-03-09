const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const diariovirtual = {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    que_sientes_que_te_preocupa: {
      type: DataTypes.STRING(64000),
      allowNull: true,
    },
    algo_genera_inseguridad: {
      type: DataTypes.STRING(64000),
      allowNull: true,
    },
    te_sientes_usado_o_manipulado: {
      type: DataTypes.STRING(64000),
      allowNull: true,
    },
    cosas_que_te_cuesta_empezar: {
      type: DataTypes.STRING(64000),
      allowNull: true,
    },
    sueños_por_cumplir: {
      type: DataTypes.STRING(64000),
      allowNull: true,
    },
    con_quien_cuesta_comunicarse: {
      type: DataTypes.STRING(64000),
      allowNull: true,
    },
    que_cosa_quieres_y_como_conseguirla: {
      type: DataTypes.STRING(64000),
      allowNull: true,
    },
    nota: {
      type: DataTypes.STRING(64000),
      allowNull: true,
    },
  };

  const config = {
    tableName: "diariovirtual",
    timestamps: true,
    paranoid: true,
  };

  const Diariovirtual = sequelize.define(
    "diariovirtual",
    diariovirtual,
    config
  );

  Diariovirtual.associate = (models) => {
    Diariovirtual.belongsTo(models.User, {
      foreingKey: "id_user"
    });
  };

  return Diariovirtual;
};
