const router = require('express').Router();
const multer = require('multer');

const controller = require('./controller');

router.post('/store', multer().none(), controller.store);
router.post('/getParticpantsByPUid', multer().none(), controller.getParticpantsByPUid);
router.post('/getAllDetailParticpantsByCUid', multer().none(), controller.getAllDetailParticpantsByCUid);
router.post('/getAllDetailParticipantsByUid', multer().none(), controller.getAllDetailParticipantsByUid);

module.exports = router;