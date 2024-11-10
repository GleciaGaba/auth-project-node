const { hash } = require("bcryptjs"); //importation de la fonction hash

//value ===> mot de passe
//saltValue ===> valeur du sel utilisé pour le hachage.
//Sel est une valeur aléatoire ajoutée au mot de passe.
exports.doHash = (value, saltValue) => {
  const result = hash(value, saltValue);
  return result;
};

exports.doHashValidation = (value, hashedValue) => {
  const result = compare(value, hashedValue);
  return result;
};
