import express from 'express';
const router = express.Router();

import { getCities } from '../controllers/vietnamAddressController.js';

router.get('/', getCities);

export default router;
