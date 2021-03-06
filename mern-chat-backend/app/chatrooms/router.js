const router = require('express').Router();
const multer = require('multer');

const controller = require('./controller');

router.get('/deleteAll', controller.deleteAll);
router.post('/store', multer().none(), controller.store);
router.post('/getChatroomsByPCid', multer().none(), controller.getChatroomsByPCid);

module.exports = router;