const router = require('express').Router();
const multer = require('multer');

const controller = require('./controller');

router.get('/deleteAll', controller.deleteAll);
router.post('/store', multer().none(), controller.store);
router.post('/getContactsByUserId', multer().none(), controller.getContactsByUserId);
router.post('/getInContactByUserId', multer().none(), controller.getInContactByUserId);

module.exports = router;