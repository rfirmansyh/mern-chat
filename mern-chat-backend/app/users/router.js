const router = require('express').Router();
const multer = require('multer');

const controller = require('./controller');

router.get('/', controller.getAllUsers);
router.post('/getAllUsersExcepts', multer().none(), controller.getAllUsersExcepts);
router.post('/getAllUsersExceptsByUserId', multer().none(), controller.getAllUsersExceptsByUserId);

module.exports = router;