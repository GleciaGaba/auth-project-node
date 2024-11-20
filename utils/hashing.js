const { createHmac } = require("crypto");
const bcrypt = require("bcrypt");
//importation de la fonction hash

//value ===> mot de passe
//saltValue ===> valeur du sel utilisé pour le hachage.
//Sel est une valeur aléatoire ajoutée au mot de passe.
exports.doHash = async (value, saltValue) => {
  const result = await bcrypt.hash(value, saltValue);
  return result;
};

exports.doHashValidation = async (value, hashedValue) => {
  if (!value || !hashedValue) {
    throw new Error("data and hash arguments required");
  }
  return await bcrypt.compare(value, hashedValue);
};

exports.hmacProcess = (value, key) => {
  const result = createHmac("sha256", key).update(value).digest("hex");
  return result;
};
