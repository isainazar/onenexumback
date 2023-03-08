const {
  Vidayrelaciones,
  Trabajo,
  Gustoseintereses,
  Diariovirtual,
  User,
} = require("../DataBase/index");

const getVidayrelaciones = async (req, res) => {
  const { user } = req.params;
  if (!user) {
    return res.status(403).json({ message: "Falta informacion" });
  }
  const usuario = await User.findByPk(user);
  if (!usuario) {
    return res.status(403).json({ message: "Usuario inexistente" });
  }
  try {
    const post = await Vidayrelaciones.findOne({
      where: {
        id_user: usuario.dataValues.id_user,
      },
    });
    if (!post) {
      return res
        .status(404)
        .json({ message: "No se encuentra post asociado a este usuario" });
    }
    const data = {
      opt1: post.dataValues.estado_civil,
      opt2: post.dataValues.amantes_o_dos_parejas,
      opt3: post.dataValues.relacion_con_personas,
      opt4: post.dataValues.mas_aprecia_en_personas,
      opt5: post.dataValues.acutalmente_relacion,
      opt6: post.dataValues.descripcion_relacion,
      opt7: post.dataValues.esta_en_tus_planes_relacion,
      opt8: post.dataValues.relacion_familia,
      opt9: post.dataValues.tienes_amistades,
    };
    return res.status(200).json({ message: data });
  } catch (err) {
    return res.status(500).json({ message: "Error inesperado" });
  }
};
const getGustoseintereses = async (req, res) => {
  const { user } = req.params;
  if (!user) {
    return res.status(403).json({ message: "Falta informacion" });
  }
  const usuario = await User.findByPk(user);
  if (!usuario) {
    return res.status(403).json({ message: "Usuario inexistente" });
  }
  try {
    const post = await Gustoseintereses.findOne({
      where: {
        id_user: usuario.dataValues.id_user,
      },
    });
    if (!post) {
      return res
        .status(404)
        .json({ message: "No se encuentra post asociado a este usuario" });
    }
    const data = {
      opt1: post.dataValues.generos_musica,
      opt2: post.dataValues.arte_y_diseño,
      opt3: post.dataValues.aprecio_gusto_artistico,
      opt4: post.dataValues.identificado_e_intereses,
    };
    return res.status(200).json({ message: data });
  } catch (err) {
    return res.status(500).json({ message: "Error inesperado" });
  }
};
const postVidayrelaciones = async (req, res) => {
  const { opt1, opt2, opt3, opt4, opt5, opt6, opt7, opt8, opt9, user } =
    req.body;

  if (!user) {
    return res.status(403).json({ message: "Falta informacion" });
  }
  const userr = await User.findByPk(user);
  if (!userr) {
    return res.status(403).json({ message: "Usuario inexistente" });
  }

  const vyr = await Vidayrelaciones.create({
    estado_civil: opt1.toLowerCase(),
    amantes_o_dos_parejas: opt2.toLowerCase(),
    relacion_con_personas: opt3.toLowerCase(),
    mas_aprecia_en_personas: opt4.toLowerCase(),
    acutalmente_relacion: opt5.toLowerCase(),
    descripcion_relacion: opt6.toLowerCase(),
    esta_en_tus_planes_relacion: opt7.toLowerCase(),
    relacion_familia: opt8.toLowerCase(),
    tienes_amistades: opt9.toLowerCase(),
    id_user: userr.dataValues.id_user,
    first_time_completed: false,
  });

  if (vyr) {
    return res.status(200).json({
      message: "Espacio personal creado correctamente",
      data: vyr,
    });
  } else {
    return res.status(500).json({
      err: "err",
    });
  }
};
const postGustoseintereses = async (req, res) => {
  const { opt1, opt2, opt3, opt4, user } = req.body;
  if (!user) {
    return res.status(403).json({ message: "Falta informacion" });
  }
  const userr = await User.findByPk(user);
  if (!userr) {
    return res.status(403).json({ message: "Usuario inexistente" });
  }
  const gei = await Gustoseintereses.create({
    generos_musica: opt1,
    arte_y_diseño: opt2.toLowerCase(),
    aprecio_gusto_artistico: opt3.toLowerCase(),
    identificado_e_intereses: opt4,
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
  const { opt1, opt2, opt3, opt4, opt5, user } = req.body;

  if (!user) {
    return res.status(403).json({ message: "Falta informacion" });
  }
  const usuario = await User.findByPk(user);
  if (!usuario) {
    return res.status(403).json({ message: "Usuario inexistente" });
  }
  const t = await Trabajo.create({
    trabajo_y_rol: opt1.toLowerCase(),
    disfrutas_trabajo: opt2.toLowerCase(),
    cumples_objetivos_y_obligaciones: opt3.toLowerCase(),
    buen_ambiente_laboral: opt4.toLowerCase(),
    priorizar_trabajo_sobre_vida: opt5.toLowerCase(),
    id_user: usuario.dataValues.id_user,
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
      .json({ message: "Error al crear el Espacio personal" });
  }
};
const getTrabajo = async (req, res) => {
  const { user } = req.params;
  if (!user) {
    return res.status(403).json({ message: "Falta informacion" });
  }
  const usuario = await User.findByPk(user);
  if (!usuario) {
    return res.status(403).json({ message: "Usuario inexistente" });
  }
  try {
    const post = await Trabajo.findOne({
      where: {
        id_user: usuario.dataValues.id_user,
      },
    });
    if (!post) {
      return res
        .status(200)
        .json({ message: "No se encuentra post asociado a este usuario" });
    }
    const data = {
      opt1: post.dataValues.trabajo_y_rol,
      opt2: post.dataValues.disfrutas_trabajo,
      opt3: post.dataValues.cumples_objetivos_y_obligaciones,
      opt4: post.dataValues.buen_ambiente_laboral,
      opt5: post.dataValues.priorizar_trabajo_sobre_vida,
    };
    return res.status(200).json({ message: data });
  } catch (err) {
    return res.status(500).json({ message: "Error inesperado" });
  }
};

const getDiario = async (req, res) => {
  const { user } = req.params;
  if (!user) {
    return res.status(403).json({ message: "Falta informacion" });
  }
  const usuario = await User.findByPk(user);
  if (!usuario) {
    return res.status(403).json({ message: "Usuario inexistente" });
  }
  try {
    const posts = await Diariovirtual.findAll({
      where: {
        user_id: usuario.dataValues.user_id,
      },
      include: {
        association: "diariovirtual_by_user",
        through: {
          attributes: [],
        },
      },
    });
    return res.status(200).json(posts || []);
  } catch (err) {
    return res.status(500).json({ message: err });
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
    user,
  } = req.body;

  if (!user) {
    return res.status(403).json({ message: "Falta informacion" });
  }
  const usuario = await User.findByPk(user.id_user);
  if (!usuario) {
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
  const diarioDef = await Promise.all(
    await nuevoDiarioVirtual.addUser(usuario)
  );
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
  const { opt1, opt2, opt3, opt4, opt5, opt6, opt7, opt8, opt9, user } =
    req.body;

  if (!user) {
    return res.status(403).json({ message: "Falta informacion" });
  }
  const userr = await User.findByPk(user);
  if (!userr) {
    return res.status(403).json({ message: "Usuario inexistente" });
  }
  const vyr = await Vidayrelaciones.update(
    {
      estado_civil: opt1.toLowerCase(),
      amantes_o_dos_parejas: opt2.toLowerCase(),
      relacion_con_personas: opt3.toLowerCase(),
      mas_aprecia_en_personas: opt4.toLowerCase(),
      acutalmente_relacion: opt5.toLowerCase(),
      descripcion_relacion: opt6.toLowerCase(),
      esta_en_tus_planes_relacion: opt7.toLowerCase(),
      relacion_familia: opt8.toLowerCase(),
      tienes_amistades: opt9.toLowerCase(),
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
  const { opt1, opt2, opt3, opt4, user } = req.body;
  if (!user) {
    return res.status(403).json({ message: "Falta informacion" });
  }
  const userr = await User.findByPk(user);
  if (!userr) {
    return res.status(403).json({ message: "Usuario inexistente" });
  }
  const gei = await Gustoseintereses.update(
    {
      generos_musica: opt1,
      arte_y_diseño: opt2.toLowerCase(),
      aprecio_gusto_artistico: opt3.toLowerCase(),
      identificado_e_intereses: opt4,
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
  const { opt1, opt2, opt3, opt4, opt5, user } = req.body;

  if (!user) {
    return res.status(403).json({ message: "Falta informacion" });
  }
  const usuario = await User.findByPk(user);
  if (!usuario) {
    return res.status(403).json({ message: "Usuario inexistente" });
  }
  const t = await Trabajo.update(
    {
      trabajo_y_rol: opt1.toLowerCase(),
      disfrutas_trabajo: opt2.toLowerCase(),
      cumples_objetivos_y_obligaciones: opt3.toLowerCase(),
      buen_ambiente_laboral: opt4.toLowerCase(),
      priorizar_trabajo_sobre_vida: opt5.toLowerCase(),
    },
    {
      where: {
        id_user: usuario.dataValues.id_user,
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
  getVidayrelaciones,
  postVidayrelaciones,
  postGustoseintereses,
  postTrabajo,
  postDiarioVirtual,
  putVidayrelaciones,
  putGustoseintereses,
  putTrabajo,
  getGustoseintereses,
  getTrabajo,
  getDiario,
};
