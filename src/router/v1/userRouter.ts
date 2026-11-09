import { Router } from "express";
import { getUser } from "../../controller/v1/userController.js";

const router = Router();
router.use("/",getUser);

export default router;