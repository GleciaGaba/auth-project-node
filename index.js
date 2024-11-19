// importations des modules nécessaires
require("dotenv").config(); //permet de charger les variables d'environnement
const express = require("express"); // créer le serveur
const helmet = require("helmet"); // sécurité
const cors = require("cors"); //cross-origin
const cookieParser = require("cookie-parser"); //analyser les cookies
const mongoose = require("mongoose"); //interation avec MongoDB
const bodyParser = require("body-parser");

//import router
const authRouter = require("./routers/authRouter");
const postRouter = require("./routers/postRouter");

//creation de l'application express
const app = express();
app.use(cors());
app.use(helmet()); //ajoute des en-tetes HTTP pour sécuriser l'application
app.use(cookieParser()); // analyse les cookies des requetes entrantes
app.use(express.json()); //payload JSON
app.use(express.urlencoded({ extended: true })); //Analyse les requêtes avec un payload URL-encoded.
app.use(bodyParser.json());

//Connexion à la base de données
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Database Connected");
  })
  .catch((err) => {
    console.log(err);
  });

//Définition d'une route de base
app.use("/api/auth", authRouter);
app.use("/api/posts", postRouter);
app.get("/", (req, res) => {
  res.json({ message: "Hello from the server" });
});
// Démarrage du serveur
app.listen(process.env.PORT || 3000);
