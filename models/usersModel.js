//importation des modules
const { required } = require("joi"); //pour la validation des données
const { verify } = require("jsonwebtoken"); //pour la vérification des tokens JWT
const mongoose = require("mongoose"); // interation avec MongoDB

//définition du schema de l'utilisateur
//structure des documents utilisateur dans la base de données
const userSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required!"],
      trim: true, //supprime les espaces en début et en fin de chaîne
      unique: [true, "Email must be unique!"],
      minLength: [5, "Email must have 5 characters!"],
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password must be provided!"],
      trim: true,
      select: false,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
      selected: false,
    },
    verificationCodeValidation: {
      type: String,
      select: false,
    },
    forgotPasswordCode: {
      type: String,
      select: false,
    },
    forgotPasswordCodeValidation: {
      type: Number,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
