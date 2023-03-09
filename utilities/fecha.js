const toDate = (date) => {
  const fechaOriginal = date;
  const fechaConvertida = new Date(fechaOriginal);
  const dia = fechaConvertida.getDate().toString().padStart(2, "0");
  const mes = (fechaConvertida.getMonth() + 1).toString().padStart(2, "0");
  const anio = fechaConvertida.getFullYear().toString();
  const fechaFinal = dia + "/" + mes + "/" + anio;
  return fechaFinal;
};

module.exports = toDate;