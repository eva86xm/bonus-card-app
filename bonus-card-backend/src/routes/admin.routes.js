const { Router } = require('express');
const adminController = require('../controllers/admin.controller');
const { requireAdmin } = require('../middleware/auth.middleware');

const router = Router();

router.use(requireAdmin);

router.get('/clients', adminController.listClients);
router.get('/clients/search', adminController.searchClient);
router.post('/bind-card', adminController.bindCard);

module.exports = router;
