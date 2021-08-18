import express from 'express';

import {
	registerUser,
	loginUser,
	getMe,
	forgotPassword,
	resetPassword,
	updateUser,
	updatePassowrd,
} from '../controllers/auth.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.put('/updateuser', auth, updateUser);
router.put('/updatepassword', auth, updatePassowrd);

router.get('/me', auth, getMe);

export default router;
