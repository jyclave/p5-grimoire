const Book = require('../models/Book');

exports.createBook = (req, res, next) => {
  const ratings = req.body.ratings || [];

  // Calcul de la moyenne des notes si ratings est fourni
  let averageRating = 0;
  if (ratings.length > 0) {
    const total = ratings.reduce((sum, rating) => sum + rating.grade, 0);
    averageRating = total / ratings.length;
  }

  // Création explicite avec userId (envoyé dans req.body.userId ou mieux : récupéré via token d'authentification)
  const book = new Book({
    userId: req.body.userId, // ou req.auth.userId si tu utilises un middleware d'auth
    title: req.body.title,
    author: req.body.author,
    imageUrl: req.body.imageUrl,
    year: req.body.year,
    genre: req.body.genre,
    ratings: ratings,
    averageRating: averageRating
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
    // On récupère le livre à modifier
    Book.findOne({ _id: req.params.id })
      .then(book => {
        // Vérification : est-ce que le user connecté est bien le créateur du livre ?
        if (book.userId.toString() !== req.auth.userId) {
          return res.status(403).json({ error: 'Accès non autorisé : vous n\'êtes pas le créateur de ce livre.' });
        }
  
        // Calcul de la nouvelle moyenne si les ratings sont modifiés (optionnel selon ton besoin)
        const ratings = req.body.ratings || book.ratings; // Si ratings envoyés, sinon on garde ceux déjà existants
  
        let averageRating = book.averageRating; // Par défaut on garde l'ancienne moyenne
        if (ratings.length > 0) {
          const total = ratings.reduce((sum, rating) => sum + rating.grade, 0);
          averageRating = total / ratings.length;
        }
  
        // Préparation des nouvelles données
        const updatedBook = {
          title: req.body.title || book.title,
          author: req.body.author || book.author,
          imageUrl: req.body.imageUrl || book.imageUrl,
          year: req.body.year || book.year,
          genre: req.body.genre || book.genre,
          ratings: ratings,
          averageRating: averageRating
        };
  
        // Mise à jour du livre
        Book.updateOne({ _id: req.params.id }, { ...updatedBook, _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Livre modifié avec succès !' }))
          .catch(error => res.status(400).json({ error }));
      })
      .catch(error => res.status(404).json({ error: 'Livre non trouvé.' }));
  };

  exports.deleteBook = (req, res, next) => {
    Book.deleteOne({ _id: req.params.id })
      .then(() => res.status(200).json({ message: 'Livre supprimé !'}))
      .catch(error => res.status(400).json({ error }));
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
  
  

  