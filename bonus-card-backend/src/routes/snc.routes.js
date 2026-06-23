const { Router } = require('express');
const sncController = require('../controllers/snc.controller');

const router = Router();

router.get('/ping', sncController.ping);
router.post('/request-sms', sncController.requestSms);
router.post('/register-card', sncController.registerCard);
router.post('/register-card/confirm', sncController.confirmRegisterCard);
router.post('/login', sncController.login);
router.post('/refresh', sncController.refreshTokens);
router.post('/logout', sncController.logout);
router.get('/user', sncController.getUser);
router.get('/owner', sncController.getOwner);
router.get('/transactions', sncController.getTransactions);
router.get('/qr-code', sncController.getQrCode);

module.exports = router;