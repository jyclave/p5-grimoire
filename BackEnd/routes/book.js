const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config')
const bookCtrl = require('../controllers/book');

router.post('/', auth, multer, bookCtrl.createBook); 
router.post('/:id/rating', auth, bookCtrl.updateBookRating); 

router.delete('/:id', auth, bookCtrl.deleteBook);
router.put('/:id', auth, multer, bookCtrl.modifyBook);


router.get('/', bookCtrl.findBooks);
router.get('/bestrating', bookCtrl.findRatingBook); 
router.get('/:id', bookCtrl.findOneBook);

module.exports = router;
