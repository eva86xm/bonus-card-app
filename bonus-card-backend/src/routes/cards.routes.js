const { Router } = require('express');
const cardsController = require('../controllers/cards.controller');
const { requireAuth } = require('../middleware/auth.middleware');

const router = Router();

router.use(requireAuth);

router.get('/me', cardsController.getMyCard);
router.get('/me/transactions', cardsController.getMyTransactions);

module.exports = router;
