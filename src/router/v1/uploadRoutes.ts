import { Router } from 'express';
import uploadController from '../../controller/v1/uploadController.js';
import upload from '../../utils/multer.js';
const router = Router();

router.post("/",upload.single('video'),uploadController);

export default router;