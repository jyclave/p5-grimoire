const mongoose = require('mongoose');
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const bookRoutes = require('./routes/book');
const userRoutes = require('./routes/user');


mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000 // Réduit le temps d'attente en cas de problème
})
.then(() => console.log('✅ Connexion réussie à MongoDB !'))
.catch(error => console.error('❌ Erreur de connexion MongoDB :', error));


const app = express();

app.use(cors({ origin: "*" }));
app.use(bodyParser.json());

app.use('/api/books', bookRoutes);
app.use('/api/auth', userRoutes);

module.exports = app;
