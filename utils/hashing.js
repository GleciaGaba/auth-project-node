const { createHmac } = require("crypto");
const { hash, compare } = require("bcrypt");
//importation de la fonction hash

//value ===> mot de passe
//saltValue ===> valeur du sel utilisé pour le hachage.
//Sel est une valeur aléatoire ajoutée au mot de passe.
exports.doHash = async (value, saltValue) => {
  const result = await hash(value, saltValue);
  return result;
};

exports.doHashValidation = async (value, hashedValue) => {
  const result = await compare(value, hashedValue);
  return result;
};

exports.hmacProcess = (value, key) => {
  const result = createHmac("sha256", key).update(value).digest("hex");
  return result;
};
