const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const bookCtrl = require('../controllers/book');
const { upload, processImage } = require('../middleware/multer-config');

router.post('/', auth, upload, processImage, bookCtrl.createBook); 
router.post('/:id/rating', auth, bookCtrl.updateBookRating); 

router.delete('/:id', auth, bookCtrl.deleteBook);
router.put('/:id', auth, upload, processImage, bookCtrl.modifyBook);


router.get('/', bookCtrl.findBooks);
router.get('/bestrating', bookCtrl.findRatingBook); 
router.get('/:id', bookCtrl.findOneBook);

module.exports = router;