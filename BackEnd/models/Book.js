const mongoose = require('mongoose');

  const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    imageUrl: { type: String, required: true },
    year: { type: Number, required: true },
    genre: { type: String, required: true },
    ratings: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        grade: { type: Number, required: true, min: 0, max: 5 }
      }
    ],
    averageRating: { type: Number, default: 0 }
  });

module.exports = mongoose.model('Book', bookSchema);
