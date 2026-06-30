const { Router } = require('express');
const sncController = require('../controllers/snc.controller');
const { createRateLimiter } = require('../middleware/rate-limit.middleware');

const router = Router();
const authRateLimit = createRateLimiter({
  windowMs: 5 * 60 * 1000,
  max: 10
});

router.get('/ping', sncController.ping);
router.post('/request-sms', authRateLimit, sncController.requestSms);
router.post('/register-card', authRateLimit, sncController.registerCard);
router.post('/register-card/confirm', authRateLimit, sncController.confirmRegisterCard);
router.post('/register-complete', authRateLimit, sncController.completeRegistration);
router.post('/login', authRateLimit, sncController.login);
router.post('/refresh', sncController.refreshTokens);
router.post('/logout', sncController.logout);
router.get('/user', sncController.getUser);
router.put('/profile/name', sncController.updateProfileName);
router.get('/owner', sncController.getOwner);
router.get('/transactions', sncController.getTransactions);
router.get('/qr-code', sncController.getQrCode);

module.exports = router;
