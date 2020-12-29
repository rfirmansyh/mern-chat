const router = require('express').Router();
const multer = require('multer');

const controller = require('./controller');

router.get('/', controller.getAllMessage);
router.post('/chatroomId', multer().none(), controller.getMessagesByChatroomId);
router.post('/store', multer().none(), controller.store);

module.exports = router;