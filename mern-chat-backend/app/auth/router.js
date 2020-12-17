const router = require('express').Router();
const multer = require('multer');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const controller = require('./controller');

passport.use(new LocalStrategy({usernameField: 'email'}, controller.localStrategy));

router.post('/register', multer().none(), controller.register);
router.post('/login', multer().none(), controller.login);
router.post('/logout', multer().none(), controller.logout);
router.get('/me', controller.me);

module.exports = router;
