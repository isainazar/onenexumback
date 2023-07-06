const codeIsValid = (userCode, frontCode)=>{
    if(userCode!==Number(frontCode)){
      return false
    }
    return true
  }

  module.exports={codeIsValid}