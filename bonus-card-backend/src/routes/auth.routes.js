const { Router } = require('express');
const authController = require('../controllers/auth.controller');

const router = Router();

router.post('/request-code', authController.requestCode);
router.post('/verify-code', authController.verifyCode);
router.post('/logout', authController.logout);

module.exports = router;
