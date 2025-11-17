import { Router } from 'express';
import { getPhonesController, getPhoneBySlugController, comparePhones } from '../controllers/phoneController.js';

const router = Router();

router.get('/', getPhonesController);
router.get('/compare', comparePhones);
router.get('/:slug', getPhoneBySlugController);

export default router;
