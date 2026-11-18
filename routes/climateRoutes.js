import { Router } from 'express';
import { home, search, results, popular } from '../controllers/climateController.js';

const router = Router();
router.get('/', home);
router.post('/search', search);
router.get('/results', results);
router.get('/popular', popular);
export default router;
