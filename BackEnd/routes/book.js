const express = require('express');
const router = express.Router();

const bookCtrl = require('../controllers/book')


router.post('/', bookCtrl.createBook);
router.post('/:id/rating', bookCtrl.updateBookRating);
router.put('/:id', bookCtrl.modifyBook);
router.delete('/:id', bookCtrl.deleteBook);
router.get('/:id', bookCtrl.findOneBook);
router.get('/', bookCtrl.findBooks);
router.get('/bestrating', bookCtrl.findRatingBook);


module.exports = router;
