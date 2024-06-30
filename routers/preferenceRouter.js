const { Router } = require('express');
const { preferenceController } = require('../controllers/preferenceController');

const preferenceRouter = Router();

preferenceRouter.get('/', preferenceController.getPreference);
preferenceRouter.post('/', preferenceController.addPreference);
preferenceRouter.put('/:accessCode', preferenceController.updatePreference);
preferenceRouter.get('/calculate', preferenceController.getVacationResults);

module.exports = { preferenceRouter };