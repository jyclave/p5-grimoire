const express = require('express');
const bodyParser = require('body-parser');

const cors = require ('cors');

const bookRoutes = require('./routes/book');
const userRoutes = require('./routes/user');

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://GrimoireP6:DvTcwx64Q43T1lLU@openclassrooms.muaak.mongodb.net/?retryWrites=true&w=majority&appName=OpenClassRooms";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    console.log("Tentative de connexion à MongoDB...");
    await client.connect();
    console.log("✅ Connexion réussie à MongoDB !");
  } catch (error) {
    console.error("❌ Erreur de connexion à MongoDB :", error);
  }
}

run();

const app = express();


app.use(cors( { origin: "*"} ));
app.use(bodyParser.json());

app.use('/api/books', bookRoutes);
app.use('/api/auth', userRoutes);


module.exports = app;
