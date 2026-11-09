import { Router } from "express";
import uploadRouter from '../v1/uploadRoutes.js';
import userRouter from '../v1/userRouter.js';

const router=Router();

router.use("/users",userRouter);
router.use("/upload",uploadRouter);

export default router;