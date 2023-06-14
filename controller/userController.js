const {
  User,
  Login,
  Secciona,
  Seccionb,
  Valoracionsecciona,
  Valoracionseccionb,
} = require("../DataBase/index.js");
models = require("../DataBase/index.js");
const Stripe = require("stripe");
const KEY_PRIVATE_STRIPE = process.env.KEY_PRIVATE_STRIPE;
const URL = process.env.URL;
const stripe = new Stripe(KEY_PRIVATE_STRIPE);
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;
const bcrypt = require("bcrypt");
const generateRandomPassword = require("../utilities/generateRandomPassword");
const { sendEmail } = require("../utilities/sendEmail");
const { encrypt, decrypt } = require("../utilities/cifrado");
const { checkUserPaymentStatus } = require("./stripeController.js");
require("dotenv").config();
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

const createUser = async (req, res, next) => {
  const { name, lastname, password, email, user_type } = req.body;
  if (!name || !lastname || !email || !password || !user_type) {
    return res.status(500).json({ message: "Se requieren todos los campos" });
  }

  if (validarEmail(email) === "This email is incorrect") {
    return res.status(501).json({ message: "Este mail no es válido" });
  }

  try {
    let user1 = await User.findOne({ where: { email } });
    // Si el correo ya está registrado, devuelvo un error

    if (user1) {
      if (user1.dataValues.status) {
        return res
          .status(500)
          .json({ message: "Ya existe un usuario con este email" });
      }
    }

    const nombreE = encrypt(name);
    const apellidoE = encrypt(lastname);

    // Creamos el nuevo usuario y lo guardamos en la DB

    const user = await User.create({
      name: nombreE,
      lastname: apellidoE,
      email,
      password,
      user_type,
    });
    // generamos el payload/body para generar el token
    if (!user) {
      return res
        .status(500)
        .json({ message: "No se pudo crear el usuario en la db" });
    }
    var aleatorio = Math.floor(Math.random() * 900000) + 100000;

    const mail = await sendEmail(
      "Verificacion de usuario",
      "",
      false,
      user.dataValues.email,
      `<html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" style="font-family:arial, 'helvetica neue', helvetica, sans-serif">
      <head>
      <meta charset="UTF-8">
      <meta content="width=device-width, initial-scale=1" name="viewport">
      <meta name="x-apple-disable-message-reformatting">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta content="telephone=no" name="format-detection">
      <title>Nuevo mensaje</title><!--[if (mso 16)]>
      <style type="text/css">
      a {text-decoration: none;}
      </style>
      <![endif]--><!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]--><!--[if gte mso 9]>
      <xml>
      <o:OfficeDocumentSettings>
      <o:AllowPNG></o:AllowPNG>
      <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
      </xml>
      <![endif]--><!--[if !mso]><!-- -->
      <link href="https://fonts.googleapis.com/css2?family=Poppins&display=swap" rel="stylesheet"><!--<![endif]-->
      <style type="text/css">
      #outlook a {
      padding:0;
      }
      .es-button {
      mso-style-priority:100!important;
      text-decoration:none!important;
      }
      a[x-apple-data-detectors] {
      color:inherit!important;
      text-decoration:none!important;
      font-size:inherit!important;
      font-family:inherit!important;
      font-weight:inherit!important;
      line-height:inherit!important;
      }
      .es-desk-hidden {
      display:none;
      float:left;
      overflow:hidden;
      width:0;
      max-height:0;
      line-height:0;
      mso-hide:all;
      }
      @media only screen and (max-width:600px) {p, ul li, ol li, a { line-height:150%!important } h1, h2, h3, h1 a, h2 a, h3 a { line-height:120% } h1 { font-size:30px!important; text-align:center!important } h2 { font-size:24px!important; text-align:center!important } h3 { font-size:20px!important; text-align:center!important } .es-header-body h1 a, .es-content-body h1 a, .es-footer-body h1 a { font-size:30px!important; text-align:center!important } .es-header-body h2 a, .es-content-body h2 a, .es-footer-body h2 a { font-size:24px!important; text-align:center!important } .es-header-body h3 a, .es-content-body h3 a, .es-footer-body h3 a { font-size:20px!important; text-align:center!important } .es-menu td a { font-size:14px!important } .es-header-body p, .es-header-body ul li, .es-header-body ol li, .es-header-body a { font-size:14px!important } .es-content-body p, .es-content-body ul li, .es-content-body ol li, .es-content-body a { font-size:14px!important } .es-footer-body p, .es-footer-body ul li, .es-footer-body ol li, .es-footer-body a { font-size:14px!important } .es-infoblock p, .es-infoblock ul li, .es-infoblock ol li, .es-infoblock a { font-size:12px!important } *[class="gmail-fix"] { display:none!important } .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3 { text-align:center!important } .es-m-txt-r, .es-m-txt-r h1, .es-m-txt-r h2, .es-m-txt-r h3 { text-align:right!important } .es-m-txt-l, .es-m-txt-l h1, .es-m-txt-l h2, .es-m-txt-l h3 { text-align:left!important } .es-m-txt-r img, .es-m-txt-c img, .es-m-txt-l img { display:inline!important } .es-button-border { display:inline-block!important } a.es-button, button.es-button { font-size:18px!important; display:inline-block!important } .es-adaptive table, .es-left, .es-right { width:100%!important } .es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { width:100%!important; max-width:600px!important } .es-adapt-td { display:block!important; width:100%!important } .adapt-img { width:100%!important; height:auto!important } .es-m-p0 { padding:0px!important } .es-m-p0r { padding-right:0px!important } .es-m-p0l { padding-left:0px!important } .es-m-p0t { padding-top:0px!important } .es-m-p0b { padding-bottom:0!important } .es-m-p20b { padding-bottom:20px!important } .es-mobile-hidden, .es-hidden { display:none!important } tr.es-desk-hidden, td.es-desk-hidden, table.es-desk-hidden { width:auto!important; overflow:visible!important; float:none!important; max-height:inherit!important; line-height:inherit!important } tr.es-desk-hidden { display:table-row!important } table.es-desk-hidden { display:table!important } td.es-desk-menu-hidden { display:table-cell!important } .es-menu td { width:1%!important } table.es-table-not-adapt, .esd-block-html table { width:auto!important } table.es-social { display:inline-block!important } table.es-social td { display:inline-block!important } .es-desk-hidden { display:table-row!important; width:auto!important; overflow:visible!important; max-height:inherit!important } }
      </style>
      </head>
      <body style="width:100%;font-family:arial, 'helvetica neue', helvetica, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0">
      <div class="es-wrapper-color" style="background-color:#FFFFFF"><!--[if gte mso 9]>
      <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
      <v:fill type="tile" color="#ffffff"></v:fill>
      </v:background>
      <![endif]-->
      <table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;background-color:#FFFFFF">
      <tr>
      <td valign="top" style="padding:0;Margin:0">
      <table cellpadding="0" cellspacing="0" class="es-header" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top">
      <tr>
      <td align="center" style="padding:0;Margin:0">
      <table bgcolor="#fad939" class="es-header-body" align="center" cellpadding="0" cellspacing="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:510px">
      <tr>
      <td align="left" style="padding:0;Margin:0;padding-left:20px;padding-right:20px">
      <table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
      <tr>
      <td align="center" valign="top" style="padding:0;Margin:0;width:470px">
      <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
      <tr>
      <td align="center" height="40" style="padding:0;Margin:0"></td>
      </tr>
      </table></td>
      </tr>
      </table></td>
      </tr>
      </table></td>
      </tr>
      </table>
      <table class="es-content" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
      <tr>
      <td align="center" style="padding:0;Margin:0">
      <table class="es-content-body" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:510px" cellspacing="0" cellpadding="0" align="center" bgcolor="#FAD939">
      <tr>
      <td align="left" style="padding:0;Margin:0">
      <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
      <tr>
      <td class="es-m-p0r" valign="top" align="center" style="padding:0;Margin:0;width:510px">
      <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
      <tr>
      <td align="center" style="padding:0;Margin:0;position:relative"><img class="adapt-img" src="https://xeowno.stripocdn.email/content/guids/bannerImgGuid/images/image16867684218386147.png" alt title width="510" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"></td>
      </tr>
      </table></td>
      </tr>
      </table></td>
      </tr>
      </table></td>
      </tr>
      </table>
      <table cellpadding="0" cellspacing="0" class="es-content" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
      <tr>
      <td align="center" style="padding:0;Margin:0">
      <table bgcolor="#ffffff" class="es-content-body" align="center" cellpadding="0" cellspacing="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FAD939;border-radius:0 0 50px 50px;width:510px">
      <tr>
      <td align="left" style="padding:0;Margin:0;padding-left:20px;padding-right:20px">
      <table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
      <tr>
      <td align="center" valign="top" style="padding:0;Margin:0;width:470px">
      <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
      <tr>
      <td align="center" style="padding:0;Margin:0"><h1 style="Margin:0;line-height:46px;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;font-size:38px;font-style:normal;font-weight:bold;color:#5d541d">Please confirm<br>your email address</h1></td>
      </tr>
      <tr>
      <td align="center" style="padding:0;Margin:0;padding-top:40px;padding-bottom:40px"><h3 style="Margin:0;line-height:24px;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;font-size:20px;font-style:normal;font-weight:bold;color:#5D541D">Thanks for joining ${name}!</h3><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;line-height:27px;color:#5D541D;font-size:18px"><br></p><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;line-height:27px;color:#5D541D;font-size:18px">To finish signing up, please confirm your email address. This ensures we have the right email in case we need to contact you.</p></td>
      </tr>
      <tr>
      <td align="center" style="padding:0;Margin:0"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;line-height:42px;color:#5D541D;font-size:28px">${aleatorio}</p></td>
      </tr>
      </table></td>
      </tr>
      </table></td>
      </tr>
      <tr>
      <td align="left" style="Margin:0;padding-top:20px;padding-left:20px;padding-right:20px;padding-bottom:40px">
      <table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
      <tr>
      <td align="left" style="padding:0;Margin:0;width:470px">
      <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
      <tr>
      <td align="center" style="padding:0;Margin:0"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;line-height:21px;color:#5D541D;font-size:14px">Thanks,<br>One Nexum Team</p></td>
      </tr>
      </table></td>
      </tr>
      </table></td>
      </tr>
      </table></td>
      </tr>
      </table>
      <table cellpadding="0" cellspacing="0" class="es-header" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top">
      <tr>
      <td align="center" style="padding:0;Margin:0">
      <table bgcolor="#fad939" class="es-header-body" align="center" cellpadding="0" cellspacing="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:510px">
      <tr>
      <td align="left" style="padding:0;Margin:0;padding-left:20px;padding-right:20px">
      <table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
      <tr>
      <td align="center" valign="top" style="padding:0;Margin:0;width:470px">
      <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
      <tr>
      <td align="center" height="40" style="padding:0;Margin:0"></td>
      </tr>
      </table></td>
      </tr>
      </table></td>
      </tr>
      </table></td>
      </tr>
      </table>
      <table cellpadding="0" cellspacing="0" class="es-footer" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top">
      <tr>
      <td align="center" style="padding:0;Margin:0">
      <table bgcolor="#ffffff" class="es-footer-body" align="center" cellpadding="0" cellspacing="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#333333;border-radius:50px;width:510px">
      <tr>
      <td align="left" style="Margin:0;padding-top:20px;padding-bottom:20px;padding-left:20px;padding-right:20px"><!--[if mso]><table style="width:470px" cellpadding="0"
      cellspacing="0"><tr><td style="width:225px" valign="top"><![endif]-->
      <table cellpadding="0" cellspacing="0" class="es-left" align="left" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left">
      <tr>
      <td class="es-m-p20b" align="left" style="padding:0;Margin:0;width:225px">
      <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
      <tr>
      <td align="left" class="es-m-txt-c" style="padding:0;Margin:0;font-size:0px"><a target="_blank" href="https://viewstripo.email" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#FFFFFF;font-size:14px"><img src="https://xeowno.stripocdn.email/content/guids/CABINET_1bfc4ac6dddc4ae38edeae5cbef32bf9ff4e576d845736df126fd766dd798e9a/images/group_4076195_Ni6.png" alt="Logo" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic" height="30" title="Logo"></a></td>
      </tr>
      </table></td>
      </tr>
      </table><!--[if mso]></td><td style="width:20px"></td><td style="width:225px" valign="top"><![endif]-->
      <table cellpadding="0" cellspacing="0" class="es-right" align="right" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:right">
      <tr>
      <td align="left" style="padding:0;Margin:0;width:225px">
      <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
      <tr>
      <td align="right" class="es-m-txt-c" style="padding:0;Margin:0;padding-top:5px;font-size:0">
      <table cellpadding="0" cellspacing="0" class="es-table-not-adapt es-social" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
      <tr>
      <td align="center" valign="top" style="padding:0;Margin:0;padding-right:10px"><a target="_blank" href="https://viewstripo.email" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#FFFFFF;font-size:14px"><img src="https://xeowno.stripocdn.email/content/assets/img/social-icons/circle-white/facebook-circle-white.png" alt="Fb" title="Facebook" height="24" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"></a></td>
      <td align="center" valign="top" style="padding:0;Margin:0;padding-right:10px"><a target="_blank" href="https://viewstripo.email" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#FFFFFF;font-size:14px"><img src="https://xeowno.stripocdn.email/content/assets/img/social-icons/circle-white/twitter-circle-white.png" alt="Tw" title="Twitter" height="24" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"></a></td>
      <td align="center" valign="top" style="padding:0;Margin:0;padding-right:10px"><a target="_blank" href="https://viewstripo.email" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#FFFFFF;font-size:14px"><img src="https://xeowno.stripocdn.email/content/assets/img/social-icons/circle-white/instagram-circle-white.png" alt="Ig" title="Instagram" height="24" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"></a></td>
      <td align="center" valign="top" style="padding:0;Margin:0"><a target="_blank" href="https://viewstripo.email" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#FFFFFF;font-size:14px"><img src="https://xeowno.stripocdn.email/content/assets/img/social-icons/circle-white/youtube-circle-white.png" alt="Yt" title="Youtube" height="24" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"></a></td>
      </tr>
      </table></td>
      </tr>
      </table></td>
      </tr>
      </table><!--[if mso]></td></tr></table><![endif]--></td>
      </tr>
      </table></td>
      </tr>
      </table>
      <table cellpadding="0" cellspacing="0" class="es-content" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
      <tr>
      <td class="es-info-area" align="center" style="padding:0;Margin:0">
      <table class="es-content-body" align="center" cellpadding="0" cellspacing="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;border-radius:50px;width:510px">
      <tr>
      <td align="left" style="padding:0;Margin:0;padding-top:20px;padding-left:20px;padding-right:20px">
      <table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
      <tr>
      <td align="center" valign="top" style="padding:0;Margin:0;width:470px">
      <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
      <tr>
      <td align="center" class="es-infoblock" style="padding:0;Margin:0;line-height:14px;font-size:12px;color:#CCCCCC"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;line-height:14px;color:#CCCCCC;font-size:12px">Unsubscribe</p></td>
      </tr>
      </table></td>
      </tr>
      </table></td>
      </tr>
      </table></td>
      </tr>
      </table>
      <table cellpadding="0" cellspacing="0" class="es-header" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top">
      <tr>
      <td align="center" style="padding:0;Margin:0">
      <table bgcolor="#fad939" class="es-header-body" align="center" cellpadding="0" cellspacing="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:510px">
      <tr>
      <td align="left" style="padding:0;Margin:0;padding-left:20px;padding-right:20px">
      <table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
      <tr>
      <td align="center" valign="top" style="padding:0;Margin:0;width:470px">
      <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
      <tr>
      <td align="center" height="40" style="padding:0;Margin:0"></td>
      </tr>
      </table></td>
      </tr>
      </table></td>
      </tr>
      </table></td>
      </tr>
      </table></td>
      </tr>
      </table>
      </div>
      </body>
      </html>`
    );
    if (!mail) {
      return res
        .status(500)
        .json({ message: "No se pudo crear el usuario en la db" });
    }
    const payload = {
      user: {
        id: user.dataValues.id_user,
      },
    };

    jwt.sign(
      payload,
      JWT_SECRET,
      {
        expiresIn: "1d",
      },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({
          token: token,
          id_user: user.dataValues.id_user,
          codigo: aleatorio,
        });
      }
    );
  } catch (err) {
    return res.status(500).json({ error: err });
  }
};
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(505).json({
      message: "Se requiere un usuario o contraseña valido",
    });
  }

  try {
    const user = await User.findOne({
      where: {
        email: email,
      },
    });
    if (!user) {
      return res.status(405).json({
        message: "Este usuario no existe",
      });
    }
    const passwordfinal = bcrypt.compareSync(
      password,
      user.dataValues.password
    );
    if (!passwordfinal) {
      return res.status(404).json({
        message: "Contraseña inválida",
      });
    }
    // FIRST LOGIN
    if (user.dataValues.firstLogin === true) {
      const usuarioCambiado = await User.update(
        {
          // status: true,
          firstLogin: false,
        },
        {
          where: {
            id_user: user.dataValues.id_user,
          },
        }
      );

      const newSeccion_A = await Secciona.create({
        id_user: user.dataValues.id_user,
      });
      const newSeccion_B = await Seccionb.create({
        id_user: user.dataValues.id_user,
      });
      const newValoracion_A = await Valoracionsecciona.create({
        id_user: user.dataValues.id_user,
      });
      const newValoracion_B = await Valoracionseccionb.create({
        id_user: user.dataValues.id_user,
      });

      if (
        usuarioCambiado &&
        newSeccion_A &&
        newSeccion_B &&
        newValoracion_A &&
        newValoracion_B
      ) {
        try {
          const section_a = await Secciona.findOne({
            where: {
              id_user: user.dataValues.id_user,
            },
          });
          const section_b = await Seccionb.findOne({
            where: {
              id_user: user.dataValues.id_user,
            },
          });
          const newLogin = await Login.create({
            id_user: user.dataValues.id_user,
          });
          const newLoginDef = await Promise.all(await newLogin.addUser(user));
          if (!newLogin || !newLoginDef) {
            return res.status(409).json({
              message: "No se pudo guardar el login",
            });
          }

          const nombre = decrypt(user.dataValues.name);
          const apellido = decrypt(user.dataValues.lastname);

          const usu = {
            id_user: user.dataValues.id_user,
            name: nombre,
            lastname: apellido,
            email: user.dataValues.email,
            user_type: user.dataValues.user_type,
            status: user.dataValues.status,
            gender: user.dataValues.gender,
            relationship: user.dataValues.relationship,
            dob: user.dataValues.dob,
            country: user.dataValues.country,
            region: user.dataValues.region,
            section_a: section_a,
            section_b: section_b,
          };
          req.session.user = usu;
          const payload = {
            user: {
              id: user.dataValues.id_user,
            },
          };
          jwt.sign(
            payload,
            JWT_SECRET,
            {
              expiresIn: "1d",
            },
            (err, token) => {
              if (err) throw err;
              return res.status(200).json({
                token: token,
                id_user: user.dataValues.id_user,
                userLogged: true,
              });
            }
          );
        } catch (error) {
          return res.status(502).json({
            message:
              "Error al intentar conectar a la base de datos. Por favor, ponte en contacto con el administrador",
            error: err,
          });
        }
      } else {
        return res.status(403).json({
          message: "No se ha podido actualizar el usuario",
        });
      }
    }
    /*  if (user.dataValues.firstLogin === true) {
    
      const usuarioCambiado = await User.update(
        {
          firstLogin: false,
        },
        {
          where: {
            id_user: user.dataValues.id_user,
          },
        }
      );
      const newSeccion_A = await Seccion_A.create({
        id_user: user.dataValues.id_user,
      });
      const newSeccion_B = await Seccion_B.create({
        id_user: user.dataValues.id_user,
      });
      const newValoracion_A = await Valoracionsecciona.create({
        id_user: user.dataValues.id_user,
      });
      const newValoracion_B = await Valoracionseccionb.create({
        id_user: user.dataValues.id_user,
      });
      if (
        usuarioCambiado &&
        newSeccion_A &&
        newSeccion_B &&
        newValoracion_A &&
        newValoracion_B
      ) {
        try {
          const section_a = await Seccion_A.findOne({
            where: {
              id_user: user.dataValues.id_user,
            },
          });
          const section_b = await Seccion_B.findOne({
            where: {
              id_user: user.dataValues.id_user,
            },
          });
          const newLogin = await Login.create({
            id_user: user.dataValues.id_user,
          });

          const newLoginDef = await Promise.all(await newLogin.addUser(user));
          if (!newLogin || !newLoginDef) {
            return res.status(409).json({
              message: "No se pudo guardar el login",
            });
          }
         console.log(user.dataValues.name)

          const usu = {
            id_user: user.dataValues.id_user,
            name: decrypt(user.dataValues.name),
            lastname: decrypt(user.dataValues.lastname),
            email: user.dataValues.email,
            user_type: user.dataValues.user_type,
            status: user.dataValues.status,
            gender: decrypt(user.dataValues.gender),
            dob: decrypt(user.dataValues.date_birth),
            country: decrypt(user.dataValues.country),
            region: decrypt(user.dataValues.region),
            section_a: section_a,
            section_b: section_b,
          };
          
        //  req.session.user = usu;

          const payload = {
            user: {
              id: user.dataValues.id_user,
            },
          };
          jwt.sign(
            payload,
            JWT_SECRET,
            {
              expiresIn: "1d",
            },
            (err, token) => {
              if (err) throw err;
              return res.status(200).json({
                token: token,
                id_user: user.dataValues.id_user,
                userLogged: true,
                usuario: usu,
              });
            }
          );
        } catch (error) {
          return res.status(502).json({
            message:
              "Error al intentar conectar a la base de datos. Por favor, ponte en contacto con el administrador",
            error: err,
          });
        }
      } else {
        return res.status(403).json({
          message: "No se ha podido actualizar el usuario",
        });
      }
    } */

    // SI YA EL USUARIO SE LOGEÓ POR PRIMERA VEZ
    else {
      const newLogin = await Login.create({
        id_user: user.dataValues.id_user,
      });

      const newLoginDef = await Promise.all(await newLogin.addUser(user));
      if (!newLogin || !newLoginDef) {
        return res.status(409).json({
          message: "No se pudo guardar el login",
        });
      }
      const nombre = decrypt(user.dataValues.name);
      const apellido = decrypt(user.dataValues.lastname);
      const section_a = await Secciona.findOne({
        where: {
          id_user: user.dataValues.id_user,
        },
      });
      const section_b = await Seccionb.findOne({
        where: {
          id_user: user.dataValues.id_user,
        },
      });
      try {
        const usu = {
          id_user: user.dataValues.id_user,
          name: nombre,
          lastname: apellido,
          email: user.dataValues.email,
          user_type: user.dataValues.user_type,
          status: user.dataValues.status,
          gender: user.dataValues.gender,
          dob: user.dataValues.date_birth,
          relationship: user.dataValues.relationship,
          country: user.dataValues.country,
          region: user.dataValues.region,
          section_a: section_a,
          section_b: section_b,
          id_payment: user.dataValues.idPayment,
          section_a: section_a,
          section_b: section_b,
        };

        req.session.user = usu;
        const payload = {
          user: {
            id: user.dataValues.id_user,
          },
        };
        jwt.sign(
          payload,
          JWT_SECRET,
          {
            expiresIn: "1d",
          },
          (err, token) => {
            if (err) throw err;
            return res.status(200).json({
              token: token,
              id_user: user.dataValues.id_user,
              userLogged: true,
              usuario: usu,
            });
          }
        );
      } catch (err) {
        return res.status(510).json({
          message:
            "Error al intentar conectar a la base de datos. Por favor, ponte en contacto con el administrador",
          error: err,
        });
      }
    }
  } catch (err) {
    return res.status(500).json({
      message: "Error",
      error: err,
    });
  }
};
const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(500).json({
      message: "Es necesario el email",
    });
  }

  let temporalPassword = generateRandomPassword();

  try {
    const user = await User.findOne({
      where: {
        email,
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ message: "No existe ningun usuario con este email" });
    }

    try {
      const update = await User.update(
        {
          password: temporalPassword,
        },
        {
          where: {
            email,
          },
        }
      );

      if (!update) {
        return res
          .status(404)
          .json({ message: "El usuario no se pudo actualizar" });
      }
      try {
        const nombre = decrypt(user.dataValues.name);
        await sendEmail(
          "Recuperación de contraseña",
          "",
          false,
          user.dataValues.email,
          `<h2>Contraseña temporal para su usuario de One Nexum</h2><div>${nombre}, su contraseña temporal es: <code>${temporalPassword}</code><br>Para cambiar su contraseña por favor haz click <a href=${process.env.LINK_RESET_PASSWORD}>AQUI</a></div>`
        );
        return res.status(200).json({
          message:
            "Contraseña cambiada con éxito. Se te ha enviado un correo con la contraseña nueva. Te sugerimos cambiarla pronto.",
        });
      } catch (error) {
        return res.status(400).json({
          message: `Error al enviar el correo. `,
        });
      }
    } catch (error) {
      return res.status(400).json({
        message: "No se pudo actualizar la contraseña",
      });
    }
  } catch (error) {
    return res.status(400).json({
      message: "No existe el usuario",
    });
  }
};
const resetPassword = async (req, res) => {
  const { oldPassword, newPassword, email } = req.body;

  if (!oldPassword || !newPassword || !email) {
    return res.status(500).json({ message: "Todos los campos son requeridos" });
  }
  if (newPassword === oldPassword) {
    return res.status(404).json({
      message: "Las contraseña nueva debe ser diferente a la anterior",
    });
  }

  try {
    const user = await User.findOne({
      where: {
        email: email,
      },
    });
    if (!user) {
      return res.status(400).json({
        message: "Este usuario no existe",
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.dataValues.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "La contraseña actual es incorrecta",
      });
    }

    const contraseñaNueva = await User.update(
      {
        password: newPassword,
      },
      {
        where: {
          email: email,
        },
      }
    );
    if (contraseñaNueva) {
      const nombre = decrypt(user.dataValues.name);

      await sendEmail(
        "Cambio de contraseña",
        "",
        false,
        user.dataValues.email,
        `<h2>Cambio de contraseña!</h2><div>${nombre}, su contraseña ha sido cambiado con exito.</div>`
      );

      return res.status(200).json({
        message: "Contraseña cambiada con éxito",
      });
    } else {
      res.status(400).json({
        message: "No se pudo actualizar su contraseña",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message:
        "Error al intentar conectar a la base de datos. Por favor, ponte en contacto con el administrador",
    });
  }
};
const updateTerminos = async (req, res) => {
  const { id_user } = req.body;
  if (!id_user) {
    return res.status(500).json({ message: "Faltan campos" });
  }
  const usuarioCambiado = await User.update(
    {
      terminos: true,
    },
    {
      where: {
        id_user,
      },
    }
  );
  if (usuarioCambiado) {
    return res.status(200).json({ message: "Usuario cambiado correctamente" });
  } else {
    return res
      .status(404)
      .json({ message: "Error al intentar cambiar el usuario" });
  }
};
const getSession = async (req, res) => {
  // Si, por ejemplo, no hay nombre
  if (!req.session) {
    res.status(400).json({ message: "No existe una session en este momento" });
  }
  return res.status(200).json(req.session.user);
};
const updateMailAccepted = async (req, res) => {
  const { id_user } = req.body;

  if (!id_user) {
    return res.status(500).json({ message: "Faltan campos" });
  }
  const usuarioCambiado = await User.update(
    {
      mail_accepted: true,
    },
    {
      where: {
        id_user,
      },
    }
  );
  if (usuarioCambiado) {
    return res.status(200).json({ message: "Usuario cambiado correctamente" });
  } else {
    return res
      .status(404)
      .json({ message: "Error al intentar cambiar el usuario" });
  }
};

const updateUser = async (req, res, next) => {
  const { name, gender, dob, country, region, user, relationship } = req.body;
  if (!user) {
    return res.status(204).json({ message: "Debes llenar todos los campos" });
  }
  /*  if (validarEmail(email) === "This email is incorrect") {
    return res.status(501).json({ message: "Ingresa un email válido" });
  } */

  try {
    const nombreE = encrypt(name);
    const dateE = encrypt(dob);
    const countryE = encrypt(country);
    const regionE = encrypt(region);
    const genderE = encrypt(gender);

    const userr = await User.update(
      {
        name: nombreE,
        date_birth: dateE,
        country: countryE,
        region: regionE,
        gender: genderE,
        relationship: relationship,
      },
      {
        where: {
          id_user: user,
        },
      }
    );
    if (userr) {
      return res.status(200).json({ message: "Usuario actualizado" });
    } else {
      return res
        .status(500)
        .json({ message: "No se pudo modificar el usuario en la db" });
    }
  } catch (err) {
    return res.status(500).json({ error: err });
  }
};

const updatePayment = async (req, res) => {
  const { id_user } = req.body;
  const usuario = await User.findByPk(id_user);

  if (!usuario) {
    return res.status(404).json({ message: "Este usuario no existe" });
  }
  try {
    const updateUser = await User.update(
      {
        status: true,
      },
      {
        where: {
          id_user: usuario.dataValues.id_user,
        },
      }
    );
    return res.status(200).json({ message: updateUser });
  } catch (err) {
    return res.status(500).json({ error: err });
  }
};

const didUserPaid = async (idPayment, id_user) => {
  const info = await checkUserPaymentStatus(idPayment, id_user);
  if (info.payment_status) {
    try {
      const updateUser = await User.update(
        {
          status: true,
        },
        {
          where: {
            id_user: id_user,
          },
        }
      );
      // return res.status(200).json({ message: updateUser });
    } catch (err) {
      return res.status(500).json({ error: err });
    }
  }
};
const getUserData = async (req, res) => {
  const { id_user } = req.params;
  if (!id_user) {
    return res.status(404).json({ message: "Falta información" });
  }
  const usuario = await User.findByPk(id_user);
  if (!usuario) {
    return res.status(404).json({ message: "Usuario no encontrado" });
  }
  try {
    const section_a = await Secciona.findOne({
      where: {
        id_user: usuario.dataValues.id_user,
      },
    });
    const section_b = await Seccionb.findOne({
      where: {
        id_user: usuario.dataValues.id_user,
      },
    });

    if (!usuario.dataValues.status) {
      if (usuario.dataValues.idPayment !== null) {
        const idPayment = usuario.dataValues.idPayment;
        const id_user = usuario.dataValues.id_user;
        await didUserPaid(idPayment, id_user);
      }
    }
    /*  await User.update(
      {
        status: false,
      },
      {
        where: {
          id_user: usuario.dataValues.id_user,
        },
      }
    );   */

    const returnedUser = {
      id_user: usuario.dataValues.id_user,
      name: decrypt(usuario.dataValues.name),
      lastname: decrypt(usuario.dataValues.lastname),
      email: usuario.dataValues.email,
      status: usuario.dataValues.status,
      id_payment: usuario.dataValues.idPayment,
      relationship: usuario.dataValues.relationship,
      gender:
        usuario.dataValues.gender === null
          ? usuario.dataValues.gender
          : decrypt(usuario.dataValues.gender),
      dob:
        usuario.dataValues.date_birth === null
          ? usuario.dataValues.date_birth
          : decrypt(usuario.dataValues.date_birth),
      country:
        usuario.dataValues.country === null
          ? usuario.dataValues.country
          : decrypt(usuario.dataValues.country),
      region:
        usuario.dataValues.region === null
          ? usuario.dataValues.region
          : decrypt(usuario.dataValues.region),
      section_a: section_a,
      section_b: section_b,
    };
    return res.status(200).json({ usuario: returnedUser });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

const postSeccion_A = async (req, res) => {
  const { user } = req.body;

  if (!user.id_user) {
    return res.status(403).json({ message: "Falta informacion" });
  }
  const userr = await User.findByPk(user.id_user);
  if (!userr) {
    return res.status(403).json({ message: "Usuario inexistente" });
  }
  const newSeccion_A = await Seccion_A.create({
    id_user: userr.dataValues.id_user,
  });

  if (newSeccion_A) {
    return res.status(200).json({
      message: "Seccion A creada correctamente",
      data: newSeccion_A,
    });
  } else {
    return res.status(500).json({ message: "Error al crear Seccion A" });
  }
};
const postSeccion_B = async (req, res) => {
  const { user } = req.body;
  if (!user.id_user) {
    return res.status(403).json({ message: "Falta informacion" });
  }
  const userr = await User.findByPk(user.id_user);
  if (!userr) {
    return res.status(403).json({ message: "Usuario inexistente" });
  }
  const newSeccionB = await Seccion_B.create({
    id_user: userr.dataValues.id_user,
  });

  if (newSeccionB) {
    return res.status(200).json({
      message: "Seccion A creada correctamente",
      data: newSeccionB,
    });
  } else {
    return res.status(500).json({ message: "Error al crear Seccion A" });
  }
};
const putSeccion_A = async (req, res) => {
  const {
    completed,
    exercise1_started,
    exercise1_completed,
    exercise2_started,
    exercise2_completed,
    exercise3_started,
    exercise3_completed,
    bonus_started,
    bonus_completed,
  } = req.body;
  const { user } = req.body;
  if (!user) {
    return res.status(403).json({ message: "Falta informacion" });
  }
  const usuario = await User.findByPk(user);
  if (!usuario) {
    return res.status(403).json({ message: "Usuario inexistente" });
  }
  if (completed) {
    const newSeccionA = await Secciona.update(
      {
        completed: true,
      },
      {
        where: {
          id_user: usuario.dataValues.id_user,
        },
      }
    );
    if (newSeccionA) {
      return res.status(200).json({
        message: "Seccion A modificada correctamente",
        data: newSeccionA,
      });
    } else {
      return res.status(500).json({ message: "Error al modificar Seccion A" });
    }
  }
  if (exercise1_started) {
    const newSeccionA = await Secciona.update(
      {
        exercise1_started: true,
      },
      {
        where: {
          id_user: usuario.dataValues.id_user,
        },
      }
    );
    if (newSeccionA) {
      return res.status(200).json({
        message: "Seccion A modificada correctamente",
        data: newSeccionA,
      });
    } else {
      return res.status(500).json({ message: "Error al modificar Seccion A" });
    }
  }
  if (exercise1_completed) {
    const newSeccionA = await Secciona.update(
      {
        exercise1_completed: true,
      },
      {
        where: {
          id_user: usuario.dataValues.id_user,
        },
      }
    );
    if (newSeccionA) {
      return res.status(200).json({
        message: "Seccion A modificada correctamente",
        data: newSeccionA,
      });
    } else {
      return res.status(500).json({ message: "Error al modificar Seccion A" });
    }
  }
  if (exercise2_started) {
    const newSeccionA = await Secciona.update(
      {
        exercise2_started: true,
      },
      {
        where: {
          id_user: usuario.dataValues.id_user,
        },
      }
    );
    if (newSeccionA) {
      return res.status(200).json({
        message: "Seccion A modificada correctamente",
        data: newSeccionA,
      });
    } else {
      return res.status(500).json({ message: "Error al modificar Seccion A" });
    }
  }
  if (exercise2_completed) {
    const newSeccionA = await Secciona.update(
      {
        exercise2_completed: true,
      },
      {
        where: {
          id_user: usuario.dataValues.id_user,
        },
      }
    );
    if (newSeccionA) {
      return res.status(200).json({
        message: "Seccion A modificada correctamente",
        data: newSeccionA,
      });
    } else {
      return res.status(500).json({ message: "Error al modificar Seccion A" });
    }
  }
  if (exercise3_started) {
    const newSeccionA = await Secciona.update(
      {
        exercise3_started: true,
      },
      {
        where: {
          id_user: usuario.dataValues.id_user,
        },
      }
    );
    if (newSeccionA) {
      return res.status(200).json({
        message: "Seccion A modificada correctamente",
        data: newSeccionA,
      });
    } else {
      return res.status(500).json({ message: "Error al modificar Seccion A" });
    }
  }
  if (exercise3_completed) {
    const newSeccionA = await Secciona.update(
      {
        exercise3_completed: true,
      },
      {
        where: {
          id_user: usuario.dataValues.id_user,
        },
      }
    );
    if (newSeccionA) {
      return res.status(200).json({
        message: "Seccion A modificada correctamente",
        data: newSeccionA,
      });
    } else {
      return res.status(500).json({ message: "Error al modificar Seccion A" });
    }
  }
  if (bonus_started) {
    const newSeccionA = await Secciona.update(
      {
        bonus_started: true,
      },
      {
        where: {
          id_user: usuario.dataValues.id_user,
        },
      }
    );
    if (newSeccionA) {
      return res.status(200).json({
        message: "Seccion A modificada correctamente",
        data: newSeccionA,
      });
    } else {
      return res.status(500).json({ message: "Error al modificar Seccion A" });
    }
  }
  if (bonus_completed) {
    const newSeccionA = await Secciona.update(
      {
        bonus_completed: true,
      },
      {
        where: {
          id_user: usuario.dataValues.id_user,
        },
      }
    );
    if (newSeccionA) {
      return res.status(200).json({
        message: "Seccion A modificada correctamente",
        data: newSeccionA,
      });
    } else {
      return res.status(500).json({ message: "Error al modificar Seccion A" });
    }
  }
};
const putSeccion_B = async (req, res) => {
  const {
    completed,
    exercise1_started,
    exercise1_completed,
    exercise2_started,
    exercise2_completed,
    exercise3_started,
    exercise3_completed,
    bonus_started,
    bonus_completed,
  } = req.body;
  const { user } = req.body;
  if (!user) {
    return res.status(403).json({ message: "Falta informacion" });
  }
  const usuario = await User.findByPk(user);
  if (!usuario) {
    return res.status(403).json({ message: "Usuario inexistente" });
  }
  if (completed) {
    const newSeccionB = await Seccionb.update(
      {
        completed: true,
      },
      {
        where: {
          id_user: usuario.dataValues.id_user,
        },
      }
    );
    if (newSeccionB) {
      return res.status(200).json({
        message: "Seccion A modificada correctamente",
        data: newSeccionB,
      });
    } else {
      return res.status(500).json({ message: "Error al modificar Seccion A" });
    }
  }
  if (exercise1_started) {
    const newSeccionB = await Seccionb.update(
      {
        exercise1_started: true,
      },
      {
        where: {
          id_user: usuario.dataValues.id_user,
        },
      }
    );
    if (newSeccionB) {
      return res.status(200).json({
        message: "Seccion A modificada correctamente",
        data: newSeccionB,
      });
    } else {
      return res.status(500).json({ message: "Error al modificar Seccion A" });
    }
  }
  if (exercise1_completed) {
    const newSeccionB = await Seccionb.update(
      {
        exercise1_completed: true,
      },
      {
        where: {
          id_user: usuario.dataValues.id_user,
        },
      }
    );
    if (newSeccionB) {
      return res.status(200).json({
        message: "Seccion A modificada correctamente",
        data: newSeccionB,
      });
    } else {
      return res.status(500).json({ message: "Error al modificar Seccion A" });
    }
  }
  if (exercise2_started) {
    const newSeccionB = await Seccionb.update(
      {
        exercise2_started: true,
      },
      {
        where: {
          id_user: usuario.dataValues.id_user,
        },
      }
    );
    if (newSeccionB) {
      return res.status(200).json({
        message: "Seccion A modificada correctamente",
        data: newSeccionB,
      });
    } else {
      return res.status(500).json({ message: "Error al modificar Seccion A" });
    }
  }
  if (exercise2_completed) {
    const newSeccionB = await Seccionb.update(
      {
        exercise2_completed: true,
      },
      {
        where: {
          id_user: usuario.dataValues.id_user,
        },
      }
    );
    if (newSeccionB) {
      return res.status(200).json({
        message: "Seccion A modificada correctamente",
        data: newSeccionB,
      });
    } else {
      return res.status(500).json({ message: "Error al modificar Seccion A" });
    }
  }
  if (exercise3_started) {
    const newSeccionB = await Seccionb.update(
      {
        exercise3_started: true,
      },
      {
        where: {
          id_user: usuario.dataValues.id_user,
        },
      }
    );
    if (newSeccionB) {
      return res.status(200).json({
        message: "Seccion A modificada correctamente",
        data: newSeccionB,
      });
    } else {
      return res.status(500).json({ message: "Error al modificar Seccion A" });
    }
  }
  if (exercise3_completed) {
    const newSeccionB = await Seccionb.update(
      {
        exercise3_completed: true,
      },
      {
        where: {
          id_user: usuario.dataValues.id_user,
        },
      }
    );
    if (newSeccionB) {
      return res.status(200).json({
        message: "Seccion A modificada correctamente",
        data: newSeccionB,
      });
    } else {
      return res.status(500).json({ message: "Error al modificar Seccion A" });
    }
  }
  if (bonus_started) {
    const newSeccionB = await Seccionb.update(
      {
        bonus_started: true,
      },
      {
        where: {
          id_user: usuario.dataValues.id_user,
        },
      }
    );
    if (newSeccionB) {
      return res.status(200).json({
        message: "Seccion A modificada correctamente",
        data: newSeccionB,
      });
    } else {
      return res.status(500).json({ message: "Error al modificar Seccion A" });
    }
  }
  if (bonus_completed) {
    const newSeccionB = await Seccionb.update(
      {
        bonus_completed: true,
      },
      {
        where: {
          id_user: usuario.dataValues.id_user,
        },
      }
    );
    if (newSeccionB) {
      return res.status(200).json({
        message: "Seccion A modificada correctamente",
        data: newSeccionB,
      });
    } else {
      return res.status(500).json({ message: "Error al modificar Seccion A" });
    }
  }
};

// USER TEST
const getTest = async (req, res) => {
  const { user } = req.params;
  const { testid } = req.query;
  const testArray = [
    "Testpersonalidad1",
    "Testpersonalidad2",
    "Testpersonalidad3",
    "Testpersonalidad4",
    "Testpersonalidad5",
  ];
  if (!user || !testid) {
    return res.status(501).json({ message: "Falta informacion" });
  }
  try {
    const userDb = await User.findOne({
      where: {
        id_user: user,
      },
    });
    const test = await models[testArray[testid - 1]].findOne({
      where: {
        id_user: user,
      },
    });
    if (userDb && test) {
      return res.status(200).json({ message: test });
    } else {
      return res.status(200).json({ message: 0 });
    }
  } catch (err) {
    return res.status(500).json({ message: "Error Inesperado" });
  }
};

const getAllTest = async (req, res) => {
  const { user } = req.params;
  const testArray = [
    "Testpersonalidad1",
    "Testpersonalidad2",
    "Testpersonalidad3",
    "Testpersonalidad4",
    "Testpersonalidad5",
  ];
  const tests = [];
  if (!user) {
    return res.status(501).json({ message: "Falta informacion" });
  }
  try {
    const userDb = await User.findOne({
      where: {
        id_user: user,
      },
    });

    for (let i = 0; i < testArray.length; i++) {
      let result;
      const test = await models[testArray[i]].findOne({
        where: {
          id_user: user,
        },
      });
      if (!test) {
        result = null;
        tests.push(result);
      } else {
        result = test.dataValues.result;
        tests.push(result);
      }
    }

    if (userDb && tests) {
      return res.status(200).json({ message: tests });
    }
  } catch (err) {
    return res.status(500).json({ message: "Error Inesperado" });
  }
};

const postTest = async (req, res) => {
  const { user, result, testid } = req.body;
  const testArray = [
    "Testpersonalidad1",
    "Testpersonalidad2",
    "Testpersonalidad3",
    "Testpersonalidad4",
    "Testpersonalidad5",
  ];

  if (!user) {
    return res.status(403).json({ message: "Falta informacion" });
  }
  const userr = await User.findByPk(user);
  if (!userr) {
    return res.status(403).json({ message: "Usuario inexistente" });
  }
  const newTest = await models[testArray[testid]].create({
    id_user: userr.dataValues.id_user,
    result,
    completed: true,
  });

  if (newTest) {
    return res.status(200).json({
      message: "Test creado correctamente",
      data: newTest,
    });
  } else {
    return res.status(500).json({ message: "Error al crear Test" });
  }
};

const putTest = async (req, res) => {
  const { result, user, testid } = req.body;
  const testArray = [
    "Testpersonalidad1",
    "Testpersonalidad2",
    "Testpersonalidad3",
    "Testpersonalidad4",
    "Testpersonalidad5",
  ];
  if (!user || !result) {
    return res.status(403).json({ message: "Falta informacion" });
  }
  const usuario = await User.findByPk(user);
  if (!usuario) {
    return res.status(403).json({ message: "Usuario inexistente" });
  }

  try {
    const updateTest = await models[testArray[testid]].update(
      {
        result: result,
      },
      {
        where: {
          id_user: usuario.dataValues.id_user,
        },
      }
    );
    if (!updateTest) {
      return res.status(510).json({ message: "no se pudo actualizar el test" });
    }
    return res.status(200).json({ message: "Actualizado correctamente" });
  } catch (err) {
    return res.status(500).json({ message: "Ocurrio un error" });
  }
};

// VALORACION DE EJERCICIOS

const getValoracionA = async (req, res) => {
  const { user } = req.params;
  if (!user) {
    return res.status(501).json({ message: "Falta informacion" });
  }
  const usuario = await User.findByPk(user);
  if (!usuario) {
    return res.status(501).json({ message: "No existe el usuario" });
  }
  try {
    const valoracion = await Valoracionsecciona.findOne({
      where: { id_user: usuario.dataValues.id_user },
    });
    return res.status(200).json({ message: valoracion || [] });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};
const getValoracionB = async (req, res) => {
  const { user } = req.params;
  if (!user) {
    return res.status(501).json({ message: "Falta informacion" });
  }
  const usuario = await User.findByPk(user);
  if (!usuario) {
    return res.status(501).json({ message: "No existe el usuario" });
  }
  try {
    const valoracion = await Valoracionseccionb.findOne({
      where: { id_user: usuario.dataValues.id_user },
    });
    return res.status(200).json({ message: valoracion || [] });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

const putValoracion_A = async (req, res) => {
  const {
    valoracion_exercise_1,
    valoracion_exercise_2,
    valoracion_exercise_3,
    valoracion_bonus,
  } = req.body;
  const { user } = req.body;
  if (!user) {
    return res.status(403).json({ message: "Falta informacion" });
  }
  const userr = await User.findByPk(user);
  if (!userr) {
    return res.status(403).json({ message: "Usuario inexistente" });
  }
  if (valoracion_exercise_1) {
    const newValoracionA = await Valoracionsecciona.update(
      {
        valoracion_exercise_1: valoracion_exercise_1,
      },
      {
        where: {
          id_user: userr.dataValues.id_user,
        },
      }
    );
    if (newValoracionA) {
      return res.status(200).json({
        message: "Seccion A modificada correctamente",
        data: newValoracionA,
      });
    } else {
      return res.status(500).json({ message: "Error al modificar Seccion A" });
    }
  }
  if (valoracion_exercise_2) {
    const newValoracionA = await Valoracionsecciona.update(
      {
        valoracion_exercise_2: valoracion_exercise_2,
      },
      {
        where: {
          id_user: userr.dataValues.id_user,
        },
      }
    );
    if (newValoracionA) {
      return res.status(200).json({
        message: "Seccion A modificada correctamente",
        data: newValoracionA,
      });
    } else {
      return res.status(500).json({ message: "Error al modificar Seccion A" });
    }
  }
  if (valoracion_exercise_3) {
    const newValoracionA = await Valoracionsecciona.update(
      {
        valoracion_exercise_3: valoracion_exercise_3,
      },
      {
        where: {
          id_user: userr.dataValues.id_user,
        },
      }
    );
    if (newValoracionA) {
      return res.status(200).json({
        message: "Seccion A modificada correctamente",
        data: newValoracionA,
      });
    } else {
      return res.status(500).json({ message: "Error al modificar Seccion A" });
    }
  }
  if (valoracion_bonus) {
    const newValoracionA = await Valoracionsecciona.update(
      {
        valoracion_bonus: valoracion_bonus,
      },
      {
        where: {
          id_user: userr.dataValues.id_user,
        },
      }
    );
    if (newValoracionA) {
      return res.status(200).json({
        message: "Seccion A modificada correctamente",
        data: newValoracionA,
      });
    } else {
      return res.status(500).json({ message: "Error al modificar Seccion A" });
    }
  }
};
const putValoracion_B = async (req, res) => {
  const {
    valoracion_exercise_1,
    valoracion_exercise_2,
    valoracion_exercise_3,
    valoracion_bonus,
  } = req.body;
  const { user } = req.body;
  if (!user) {
    return res.status(403).json({ message: "Falta informacion" });
  }
  const userr = await User.findByPk(user.id_user);
  if (!userr) {
    return res.status(403).json({ message: "Usuario inexistente" });
  }
  if (valoracion_exercise_1) {
    const newValoracionA = await Valoracionseccionb.update(
      {
        valoracion_exercise_1: valoracion_exercise_1,
      },
      {
        where: {
          id_user: userr.dataValues.id_user,
        },
      }
    );
    if (newValoracionA) {
      return res.status(200).json({
        message: "Seccion A modificada correctamente",
        data: newValoracionA,
      });
    } else {
      return res.status(500).json({ message: "Error al modificar Seccion A" });
    }
  }
  if (valoracion_exercise_2) {
    const newValoracionA = await Valoracionseccionb.update(
      {
        valoracion_exercise_2: valoracion_exercise_2,
      },
      {
        where: {
          id_user: userr.dataValues.id_user,
        },
      }
    );
    if (newValoracionA) {
      return res.status(200).json({
        message: "Seccion A modificada correctamente",
        data: newValoracionA,
      });
    } else {
      return res.status(500).json({ message: "Error al modificar Seccion A" });
    }
  }
  if (valoracion_exercise_3) {
    const newValoracionA = await Valoracionseccionb.update(
      {
        valoracion_exercise_3: valoracion_exercise_3,
      },
      {
        where: {
          id_user: userr.dataValues.id_user,
        },
      }
    );
    if (newValoracionA) {
      return res.status(200).json({
        message: "Seccion A modificada correctamente",
        data: newValoracionA,
      });
    } else {
      return res.status(500).json({ message: "Error al modificar Seccion A" });
    }
  }
  if (valoracion_bonus) {
    const newValoracionA = await Valoracionseccionb.update(
      {
        valoracion_bonus: valoracion_bonus,
      },
      {
        where: {
          id_user: userr.dataValues.id_user,
        },
      }
    );
    if (newValoracionA) {
      return res.status(200).json({
        message: "Seccion A modificada correctamente",
        data: newValoracionA,
      });
    } else {
      return res.status(500).json({ message: "Error al modificar Seccion A" });
    }
  }
};

const resendEmail = async (req, res) => {
  const { email, name } = req.body;

  var aleatorio = Math.floor(Math.random() * 900000) + 100000;
  if (!email || !name) {
    return res.status(400).json({ message: "Faltan datos" });
  }
  const mail = await sendEmail(
    "Verificacion de usuario",
    "",
    false,
    email,
    `<h2>Hola</h2><div>${name}, tu código de verificación para la cuenta de One Nexum es:${aleatorio}.`
  );
  if (!mail) {
    return res
      .status(501)
      .json({ message: "Error al enviar el email, contactar a soporte" });
  }
  return res.status(200).json({ message: aleatorio });
};
module.exports = {
  login,
  createUser,
  resetPassword,
  forgotPassword,
  getSession,
  updateTerminos,
  updateMailAccepted,
  updateUser,
  updatePayment,
  postSeccion_A,
  postSeccion_B,
  putSeccion_A,
  putSeccion_B,
  getUserData,
  postTest,
  putValoracion_A,
  putValoracion_B,
  getTest,
  putTest,
  getAllTest,
  getValoracionA,
  getValoracionB,
  resendEmail,
};
