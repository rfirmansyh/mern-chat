const router = require('express').Router();
const multer = require('multer');

const controller = require('./controller');

router.post('/store', multer().none(), controller.store);
router.get('/deleteAll', controller.deleteAll);
router.post('/getParticpantsByPUid', multer().none(), controller.getParticpantsByPUid);
router.post('/getUsersParticipantByUid', multer().none(), controller.getUsersParticipantByUid);
router.post('/getAllDetailParticipantsByUid', multer().none(), controller.getAllDetailParticipantsByUid);

module.exports = router;