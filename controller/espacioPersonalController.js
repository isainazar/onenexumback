const {
  Vidayrelaciones,
  Trabajo,
  Gustoseintereses,
  Diariovirtual,
  User,
} = require("../DataBase/index");

const postVidayrelaciones = async (req, res) => {
  const {
    acutalmente_relacion,
    descripcion_relacion,
    esta_en_tus_planes_relacion,
    relacion_familia,
    tienes_amistades,
    estado_civil,
    amantes_o_dos_parejas,
    relacion_con_personas,
    mas_aprecia_en_personas,
  } = req.body;
  
  const {user} = req.session;
  
  if (!user.id_user) {
    
    return res.status(403).json({ message: "Falta informacion" });
  }
  const userr = await User.findByPk(user.id_user);
  if (!userr) {
    return res.status(403).json({ message: "Usuario inexistente" });
  }
  const vyr = await Vidayrelaciones.create({
    acutalmente_relacion,
    descripcion_relacion,
    esta_en_tus_planes_relacion,
    relacion_familia,
    tienes_amistades,
    estado_civil,
    amantes_o_dos_parejas,
    relacion_con_personas,
    mas_aprecia_en_personas,
    id_user: userr.dataValues.id_user,
    first_time_completed: false,
  });

  if (vyr) {
    return res.status(200).json({
      message: "Espacio personal creado correctamente",
      data: vyr,
    });
  } else {
    return res
      .status(500)
      .json({ message: "Error al crear el Espacio personaliz" });
  }
};
const postGustoseintereses = async (req, res) => {
  const {
    generos_musica,
    arte_y_diseño,
    aprecio_gusto_artistico,
    identificado_e_intereses,
  } = req.body;
  const { user } = req.session;
  if (!user.id_user) {
    return res.status(403).json({ message: "Falta informacion" });
  }
  const userr = await User.findByPk(user.id_user);
  if (!userr) {
    return res.status(403).json({ message: "Usuario inexistente" });
  }
  const gei = await Gustoseintereses.create({
    generos_musica,
    arte_y_diseño,
    aprecio_gusto_artistico,
    identificado_e_intereses,
    id_user: userr.dataValues.id_user,
    first_time_completed: false,
  });

  if (gei) {
    return res.status(200).json({
      message: "Espacio personal creado correctamente",
      data: gei,
    });
  } else {
    return res
      .status(500)
      .json({ message: "Error al crear el Espacio personaliz" });
  }
};
const postTrabajo = async (req, res) => {
  const {
    trabajo_y_rol,
    disfrutas_trabajo,
    cumples_objetivos_y_obligaciones,
    buen_ambiente_laboral,
    priorizar_trabajo_sobre_vida,
  } = req.body;
  const { user } = req.session;
  if (!user.id_user) {
    return res.status(403).json({ message: "Falta informacion" });
  }
  const userr = await User.findByPk(user.id_user);
  if (!userr) {
    return res.status(403).json({ message: "Usuario inexistente" });
  }
  const t = await Trabajo.create({
    trabajo_y_rol,
    disfrutas_trabajo,
    cumples_objetivos_y_obligaciones,
    buen_ambiente_laboral,
    priorizar_trabajo_sobre_vida,
    id_user: userr.dataValues.id_user,
    first_time_completed: false,
  });

  if (t) {
    return res.status(200).json({
      message: "Espacio personal creado correctamente",
      data: t,
    });
  } else {
    return res
      .status(500)
      .json({ message: "Error al crear el Espacio personaliz" });
  }
};
const postDiarioVirtual = async (req, res) => {
  const {
    que_sientes_que_te_preocupa,
    algo_genera_inseguridad,
    te_sientes_usado_o_manipulado,
    cosas_que_te_cuesta_empezar,
    sueños_por_cumplir,
    con_quien_cuesta_comunicarse,
    que_cosa_quieres_y_como_conseguirla,
    nota,
  } = req.body;
  const { user } = req.session;
  if (!user.id_user) {
    return res.status(403).json({ message: "Falta informacion" });
  }
  const userr = await User.findByPk(user.id_user);
  if (!userr) {
    return res.status(403).json({ message: "Usuario inexistente" });
  }
  const nuevoDiarioVirtual = await Diariovirtual.create({
    que_sientes_que_te_preocupa,
    algo_genera_inseguridad,
    te_sientes_usado_o_manipulado,
    cosas_que_te_cuesta_empezar,
    sueños_por_cumplir,
    con_quien_cuesta_comunicarse,
    que_cosa_quieres_y_como_conseguirla,
    nota,
  });
  const diarioDef = await Promise.all(await nuevoDiarioVirtual.addUser(userr));
  if (diarioDef) {
    return res.status(200).json({
      message: "Diario creado correctamente",
      data: diarioDef,
    });
  } else {
    return res.status(500).json({ message: "Error al crear Diario" });
  }
};
const putVidayrelaciones = async (req, res) => {
  const {
    acutalmente_relacion,
    descripcion_relacion,
    esta_en_tus_planes_relacion,
    relacion_familia,
    tienes_amistades,
    estado_civil,
    amantes_o_dos_parejas,
    relacion_con_personas,
    mas_aprecia_en_personas,
  } = req.body;
  const { user } = req.session;
  if (!user.id_user) {
    return res.status(403).json({ message: "Falta informacion" });
  }
  const userr = await User.findByPk(user.id_user);
  if (!userr) {
    return res.status(403).json({ message: "Usuario inexistente" });
  }
  const vyr = await Vidayrelaciones.update(
    {
      acutalmente_relacion,
      descripcion_relacion,
      esta_en_tus_planes_relacion,
      relacion_familia,
      tienes_amistades,
      estado_civil,
      amantes_o_dos_parejas,
      relacion_con_personas,
      mas_aprecia_en_personas,
    },
    {
      where: {
        id_user: userr.dataValues.id_user,
      },
    }
  );

  if (vyr) {
    return res.status(200).json({
      message: "Espacio personal cambiado correctamente",
      data: vyr,
    });
  } else {
    return res
      .status(500)
      .json({ message: "Error al crear el Espacio personaliz" });
  }
};
const putGustoseintereses = async (req, res) => {
  const {
    generos_musica,
    arte_y_diseño,
    aprecio_gusto_artistico,
    identificado_e_intereses,
  } = req.body;
  const { user } = req.session;
  if (!user.id_user) {
    return res.status(403).json({ message: "Falta informacion" });
  }
  const userr = await User.findByPk(user.id_user);
  if (!userr) {
    return res.status(403).json({ message: "Usuario inexistente" });
  }
  const gei = await Gustoseintereses.update(
    {
      generos_musica,
      arte_y_diseño,
      aprecio_gusto_artistico,
      identificado_e_intereses,
    },
    {
      where: {
        id_user: userr.dataValues.id_user,
      },
    }
  );

  if (gei) {
    return res.status(200).json({
      message: "Espacio personal cambiado correctamente",
      data: gei,
    });
  } else {
    return res
      .status(500)
      .json({ message: "Error al crear el Espacio personaliz" });
  }
};
const putTrabajo = async (req, res) => {
  const {
    trabajo_y_rol,
    disfrutas_trabajo,
    cumples_objetivos_y_obligaciones,
    buen_ambiente_laboral,
    priorizar_trabajo_sobre_vida,
  } = req.body;
  const { user } = req.session;
  if (!user.id_user) {
    return res.status(403).json({ message: "Falta informacion" });
  }
  const userr = await User.findByPk(user.id_user);
  if (!userr) {
    return res.status(403).json({ message: "Usuario inexistente" });
  }
  const t = await Trabajo.update(
    {
      trabajo_y_rol,
      disfrutas_trabajo,
      cumples_objetivos_y_obligaciones,
      buen_ambiente_laboral,
      priorizar_trabajo_sobre_vida,
    },
    {
      where: {
        id_user: userr.dataValues.id_user,
      },
    }
  );

  if (t) {
    return res.status(200).json({
      message: "Espacio personal cambiado correctamente",
      data: t,
    });
  } else {
    return res
      .status(500)
      .json({ message: "Error al crear el Espacio personalizado" });
  }
};
module.exports = {
  postVidayrelaciones,
  postGustoseintereses,
  postTrabajo,
  postDiarioVirtual,
  putVidayrelaciones,
  putGustoseintereses,
  putTrabajo,
};
