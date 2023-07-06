const validarEmail= (valor)=> {
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

  module.exports = validarEmail;