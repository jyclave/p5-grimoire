const express = require('express');

const app = express();

app.use((req, res) => {
  res.json({ message: 'Votre requète a bien été reçue !'});
});

module.exports = app;

