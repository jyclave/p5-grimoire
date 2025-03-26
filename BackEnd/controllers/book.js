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

// exports.modifyBook = (req, res, next) => {
//   const bookObject = req.file ? {
//       ...JSON.parse(req.body.book),
//       imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
//   } : { ...req.body };

//   delete bookObject._userId;
//   Book.findOne({_id: req.params.id})
//       .then((book) => {
//           if (book.userId != req.auth.userId) {
//               res.status(401).json({ message : 'Not authorized'});
//           } else {
//               Book.updateOne({ _id: req.params.id}, { ...bookObject, _id: req.params.id})
//               .then(() => res.status(200).json({message : 'Objet modifié!'}))
//               .catch(error => res.status(401).json({ error }));
//           }
//       })
//       .catch((error) => {
//           res.status(400).json({ error });
//       });
// };

exports.modifyBook = (req, res, next) => {
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
      }
    : { ...req.body };

  delete bookObject._userId;

  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        return res.status(401).json({ message: 'Not authorized' });
      }

      // Vérifie s'il y a une nouvelle image et supprime l'ancienne
      if (req.file && book.imageUrl) {
        const oldFilename = book.imageUrl.split('/images/')[1];
        fs.unlink(`images/${oldFilename}`, (err) => {
          if (err) console.error('Erreur lors de la suppression de l\'ancienne image :', err);
        });
      }

      Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Objet modifié!' }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id})
      .then(book => {
          if (book.userId != req.auth.userId) {
              res.status(401).json({message: 'Not authorized'});
          } else {
              const filename = book.imageUrl.split('/images/')[1];
              fs.unlink(`images/${filename}`, () => {
                  Book.deleteOne({_id: req.params.id})
                      .then(() => { res.status(200).json({message: 'Livre supprimé !'})})
                      .catch(error => res.status(401).json({ error }));
              });
          }
      })
      .catch( error => {
          res.status(500).json({ error });
      });
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