const path = require('path');
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
  console.log("📥 Requête reçue pour modifier un livre");

  // Vérifie si un fichier est bien envoyé
  console.log("🖼 Fichier reçu :", req.file ? req.file.filename : "Aucun fichier");

  let bookObject;
  try {
    bookObject = req.file
      ? {
          ...JSON.parse(req.body.book), // Vérifie si req.body.book est bien du JSON
          imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        }
      : { ...req.body };

    console.log("📄 Données du livre après parsing :", bookObject);
  } catch (error) {
    console.error("❌ Erreur de parsing JSON :", error);
    return res.status(400).json({ error: "Format de données invalide" });
  }

  delete bookObject._userId;

  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (!book) {
        console.error("❌ Livre non trouvé");
        return res.status(404).json({ message: "Livre non trouvé" });
      }

      if (book.userId != req.auth.userId) {
        console.error("⛔ Non autorisé !");
        return res.status(401).json({ message: "Not authorized" });
      }

      // Supprime l'ancienne image si une nouvelle est uploadée
      if (req.file && book.imageUrl) {
        const oldFilename = book.imageUrl.split('/images/')[1];
        const oldFilePath = path.resolve(__dirname, '../images', oldFilename);

        console.log("🗑 Suppression de l'ancienne image :", oldFilePath);

        fs.access(oldFilePath, fs.constants.F_OK, (err) => {
          if (!err) {
            fs.unlink(oldFilePath, (err) => {
              if (err) {
                console.error("❌ Erreur lors de la suppression de l'ancienne image :", err);
              }
            });
          } else {
            console.warn("⚠ Ancienne image introuvable :", oldFilePath);
          }
        });
      }

      // Met à jour le livre
      return Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id });
    })
    .then(() => {
      console.log("✅ Livre mis à jour avec succès !");
      res.status(200).json({ message: "Objet modifié!" });
    })
    .catch((error) => {
      console.error("❌ Erreur lors de la mise à jour :", error);
      res.status(400).json({ error });
    });
};

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (!book) {
        return res.status(404).json({ message: "Livre non trouvé" });
      }

      if (book.userId != req.auth.userId) {
        return res.status(401).json({ message: "Not authorized" });
      }

      // Vérifier que l'image existe avant de tenter de la supprimer
      if (book.imageUrl) {
        const filename = book.imageUrl.split('/images/')[1];
        const filePath = path.resolve(__dirname, '../images', filename);

        fs.access(filePath, fs.constants.F_OK, (err) => {
          if (!err) {
            fs.unlink(filePath, (unlinkErr) => {
              if (unlinkErr) {
                console.error("❌ Erreur lors de la suppression de l'image :", unlinkErr);
              }
            });
          } else {
            console.warn("⚠ Fichier introuvable, suppression ignorée :", filePath);
          }
        });
      }

      // Supprimer le livre après suppression de l'image
      return Book.deleteOne({ _id: req.params.id });
    })
    .then(() => res.status(200).json({ message: "Livre supprimé !" }))
    .catch((error) => res.status(500).json({ error }));
};

exports.findOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (!book) {
        return res.status(404).json({ message: "Livre non trouvé" });
      }
      res.status(200).json(book);
    })
    .catch(error => {
      console.error("❌ Erreur findOneBook :", error);
      res.status(500).json({ message: "Erreur lors de la récupération du livre" });
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