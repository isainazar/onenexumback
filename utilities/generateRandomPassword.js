const generateRandomPassword = () => {
  let randomNumber = Math.round(Math.random() * 10 ** 20);

  return randomNumber.toString(36);
};

module.exports = generateRandomPassword;
