const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const bookCtrl = require('../controllers/book');

router.get('/', bookCtrl.findBooks);
router.get('/bestrating', bookCtrl.findRatingBook); // Placé avant /:id
router.get('/:id', bookCtrl.findOneBook);

router.post('/', auth, bookCtrl.createBook); // Création d'un livre (sans ID)
router.patch('/:id/rating', auth, bookCtrl.updateBookRating); // Mise à jour de la note

router.put('/:id', auth, bookCtrl.modifyBook);
router.delete('/:id', auth, bookCtrl.deleteBook);

module.exports = router;

