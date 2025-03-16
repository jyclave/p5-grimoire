const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');

const bookCtrl = require('../controllers/book')


router.post('/', auth, bookCtrl.createBook);
router.post('/:id/rating', auth, bookCtrl.updateBookRating);
router.put('/:id', auth, bookCtrl.modifyBook);
router.delete('/:id', auth, bookCtrl.deleteBook);
router.get('/:id', bookCtrl.findOneBook);
router.get('/', bookCtrl.findBooks);
router.get('/bestrating', bookCtrl.findRatingBook);


module.exports = router;
