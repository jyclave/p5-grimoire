const Book = require('../models/Book');
const fs = require('fs');

exports.createBook = (req, res, next) => {
  console.log('🔍 Requête reçue:', req.body);
  console.log('👤 Utilisateur authentifié:', req.auth.userId);

  // ✅ Correction : Parse correctement le JSON reçu
  const bookObject = JSON.parse(req.body.book);

  // ✅ Suppression des champs non modifiables
  delete bookObject._id;
  delete bookObject._userId;

  // ✅ Création du livre avec l'image
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId, // Récupéré du token d'authentification
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });

  book.save()
    .then(() => res.status(201).json({ message: 'Livre enregistré avec succès !' }))
    .catch(error => res.status(400).json({ error }));
};



exports.updateBookRating = (req, res, next) => {
  const userId = req.body.userId;
  const rating = req.body.rating;

  // Vérification que la note est bien comprise entre 0 et 5
  if (rating < 0 || rating > 5) {
    return res.status(400).json({ error: 'La note doit être comprise entre 0 et 5.' });
  }

  // Recherche du livre par ID
  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (!book) {
        return res.status(404).json({ error: 'Livre non trouvé.' });
      }

      // Vérification que l'utilisateur n'a pas déjà noté ce livre
      const existingRating = book.ratings.find(r => r.userId.toString() === userId);
      if (existingRating) {
        return res.status(400).json({ error: 'Vous avez déjà noté ce livre.' });
      }

      // Ajout de la nouvelle note
      book.ratings.push({ userId: userId, grade: rating });

      // Recalcul de la moyenne
      const totalRatings = book.ratings.reduce((sum, rating) => sum + rating.grade, 0);
      book.averageRating = totalRatings / book.ratings.length;

      // Sauvegarde du livre mis à jour
      book.save()
        .then(updatedBook => res.status(200).json(updatedBook))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
  };

  exports.modifyBook = (req, res, next) => {
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  
    delete bookObject._userId;
    Book.findOne({_id: req.params.id})
        .then((book) => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message : 'Not authorized'});
            } else {
                Book.updateOne({ _id: req.params.id}, { ...bookObject, _id: req.params.id})
                .then(() => res.status(200).json({message : 'Livre modifié!'}))
                .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
 };

 exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id})
      .then(book => {
          if (book.userId !== req.auth.userId) {
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
      .then(book => res.status(200).json(book))
      .catch(error => res.status(404).json({ error }));
  };


  exports.findBooks = (req, res, next) => {
    Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
  };

  exports.findRatingBook = (req, res, next) => {
    Book.find()
      .sort({ averageRating: -1 }) 
      .limit(3) 
      .then(books => res.status(200).json(books)) 
      .catch(error => res.status(400).json({ error }));
  };
  
  

  