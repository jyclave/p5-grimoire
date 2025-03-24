const Book = require('../models/Book');
const fs = require('fs');
const { upload, processImage } = require('../middleware/multer-config');

exports.createBook = (req, res, next) => {
  console.log('👤 Utilisateur authentifié:', req.auth.userId);

  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;

  const book = new Book({
    ...bookObject,
    userId: req.auth.userId, 
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });

  book.save()
    .then(() => res.status(201).json({ message: 'Livre enregistré avec succès !' }))
    .catch(error => res.status(400).json({ error }));
};



exports.updateBookRating = (req, res, next) => {
  const userId = req.body.userId;
  const rating = req.body.rating;

  if (rating < 0 || rating > 5) {
    return res.status(400).json({ error: 'La note doit être comprise entre 0 et 5.' });
  }

  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (!book) {
        return res.status(404).json({ error: 'Livre non trouvé.' });
      }

      const existingRating = book.ratings.find(r => r.userId.toString() === userId);
      if (existingRating) {
        return res.status(400).json({ error: 'Vous avez déjà noté ce livre.' });
      }

      book.ratings.push({ userId: userId, grade: rating });

      const totalRatings = book.ratings.reduce((sum, rating) => sum + rating.grade, 0);
      book.averageRating = totalRatings / book.ratings.length;

      book.save()
        .then(updatedBook => res.status(200).json(updatedBook))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
  };

exports.modifyBook = (req, res, next) => {
  console.log('🔄 Mise à jour du livre:', req.params.id);

  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (!book) {
        return res.status(404).json({ message: 'Livre non trouvé' });
      }

      // Vérifier que l'utilisateur est bien propriétaire du livre
      if (book.userId.toString() !== req.auth.userId) {
        return res.status(403).json({ message: 'Action non autorisée' });
      }

      let updatedBook = { ...req.body };

      // Si une nouvelle image est envoyée
      if (req.file) {
        // Suppression de l'ancienne image
        const oldImagePath = path.join('images', path.basename(book.imageUrl));
        fs.unlink(oldImagePath, (err) => {
          if (err) console.error('❌ Erreur suppression ancienne image:', err);
          else console.log('🗑 Ancienne image supprimée:', oldImagePath);
        });

        // Mise à jour de l'image
        updatedBook.imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
      }

      Book.updateOne({ _id: req.params.id }, { ...updatedBook, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Livre mis à jour avec succès !' }))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};

exports.deleteBook = (req, res, next) => {
  console.log('🗑 Suppression du livre:', req.params.id);

  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (!book) {
        return res.status(404).json({ message: 'Livre non trouvé' });
      }

      // Vérifier que l'utilisateur est bien propriétaire du livre
      if (book.userId.toString() !== req.auth.userId) {
        return res.status(403).json({ message: 'Action non autorisée' });
      }

      // Récupérer le chemin de l'image à supprimer
      const imagePath = path.join('images', path.basename(book.imageUrl));

      // Supprimer l'image du dossier
      fs.unlink(imagePath, (err) => {
        if (err) console.error('❌ Erreur suppression image:', err);
        else console.log('🗑 Image supprimée:', imagePath);
      });

      // Supprimer le livre de la base de données
      Book.deleteOne({ _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Livre supprimé avec succès !' }))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};


exports.findOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (!book) {
        return res.status(404).json({ message: "Livre non trouvé" });
      }
      const response = {
        ...book.toObject()     
      };
      res.status(200).json(response);
    })
    .catch(error => {
      console.error("❌ Erreur findOneBook :", error);
      res.status(500).json({ error });
    });
};

  exports.findBooks = (req, res, next) => {
    Book.find()
      .then(books => {
        res.status(200).json(books);
      })
      .catch(error => {
        console.error('Erreur lors de la recherche des livres :', error);
        res.status(400).json({ error });
      });
  };

  exports.findRatingBook = (req, res, next) => {
    Book.find()
      .sort({ averageRating: -1 }) 
      .limit(3) 
      .then(books => res.status(200).json(books)) 
      .catch(error => res.status(400).json({ error }));
  };
  
  

  