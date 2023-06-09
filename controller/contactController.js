const { sendEmail } = require("../utilities/sendEmail");
const { Newsletter } = require("../DataBase/index");
function validarEmail(valor) {
  if (
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      valor
    )
  ) {
    return "This email is corect";
  } else {
    return "This email is incorrect";
  }
}

const contactController = async (req, res) => {
  const { email, message } = req.body;
  if (!email || !message) {
    return res.status(500).json({ message: "Todos los campos son requeridos" });
  }
  try {
    let html = `<h1>Contacto de ayuda</h1>
                      <div>
                        <h3>${email} dice:</h3>
                        <p>${message}</p>
                      </div>
                      `;
    let html2 = `<div> <h3>Gracias por contactarnos!</h3>
                       <p> Nuestro equipo esta haciendo lo posible para atender tu consulta</p>
                         <p>Gracias, el equipo de One Nexum</p>
                            <p>Te dejamos una copia de tu consulta:</p>
                            <p>${message}</P>
                    </div>`;
    await sendEmail(`Consulta de ${email}`, "", false, false, html);
    await sendEmail(`Recibimos tu consulta One Nexum`, "", false, email, html2);
    return res.status(200).json({
      message: "Correo enviado, aguarde su respuesta ",
    });
  } catch (error) {
    return res.status(404).json({
      message: error,
    });
  }
};
const quizNewsletter = async (req, res) => {
  const { email, checkboxs, name } = req.body;
  if (!email || !checkboxs || checkboxs.length === 0 || !name) {
    return res.status(500).json({ message: "All fields are required" });
  }
  if (validarEmail(email) === "This email is incorrect") {
    return res.status(501).json({ message: "This mail doesn't exists" });
  }
  try {
    let userN = await Newsletter.findOne({ where: { email } });
    // Si el correo ya está registrado, devuelvo un error
    if (userN) {
      return res.status(500).json({
        message: "Este email ya esta registrado en nuestro Newsletter",
      });
    }
    let html2 = `<div> <h3>Gracias por unirte e nuestro NewsLetter!</h3>
    <p> Aqui recibiras la mejor informacion sobre todas nuestras ofertas!!!</p>
      <p>Gracias, el equipo de One Nexum</p>
 </div>`;
   
 const mail = await sendEmail(
      `Newsletter One Nexum`,
      "",
      false,
      email,
      html2
    );

    if (mail) {
      
      const createNewsletter = await Newsletter.create({
        email,
        checkboxs,
        name,
      });
      if (!createNewsletter) {
        return res.status(200).json({
          message: "El usuario no pudo ser agregado correctamente",
        });
      }
      return res.status(200).json({
        message: "Fuiste agregado a nuestro newsletter correctamente",
      });
    } else {
      return res.status(203).json({
        message:
          "No pudiste ser agregado a nuestro newsletter",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Error al intentar acceder a nuestro newsletter",
      error: error,
    });
  }
};

module.exports = {
  contactController,
  quizNewsletter,
};
