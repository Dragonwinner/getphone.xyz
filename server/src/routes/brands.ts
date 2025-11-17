import { Router } from 'express';
import { getBrandsController, getBrandBySlugController } from '../controllers/brandController.js';

const router = Router();

router.get('/', getBrandsController);
router.get('/:slug', getBrandBySlugController);

export default router;
