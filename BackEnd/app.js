const mongoose = require('mongoose');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const bookRoutes = require('./routes/book');
const userRoutes = require('./routes/user');

const imagesDir = path.join(__dirname, 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir);
} else {
  console.log('Images directory already exists');
};



mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000
})
.then(() => console.log('✅ Connexion réussie à MongoDB !'))
.catch(error => console.error('❌ Erreur de connexion MongoDB :', error));

const app = express();

app.use(cors({ origin: "*" }));

app.use(express.json());

app.use('/api/books', bookRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;