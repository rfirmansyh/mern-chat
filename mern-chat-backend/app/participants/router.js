const router = require('express').Router();
const multer = require('multer');

const controller = require('./controller');

router.get('/deleteAll', controller.deleteAll);
router.post('/store', multer().none(), controller.store);
router.post('/storeGroup', multer().none(), controller.storeGroup);
router.post('/getParticpantsByPUid', multer().none(), controller.getParticpantsByPUid);
router.post('/getUsersParticipantByUid', multer().none(), controller.getUsersParticipantByUid);
router.post('/getAllDetailParticipantsByUid', multer().none(), controller.getAllDetailParticipantsByUid);
router.post('/getAllDetailParticipantByUidAndContactId', multer().none(), controller.getAllDetailParticipantByUidAndContactId);
router.post('/updateZeroUnreadMessageByChatroomIdUserId', multer().none(), controller.updateZeroUnreadMessageByChatroomIdUserId);
router.post('/updateValueUnreadMessageByChatroomIdUserId', multer().none(), controller.updateValueUnreadMessageByChatroomIdUserId);

module.exports = router;