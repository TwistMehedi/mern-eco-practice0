import express from 'express';
import { createUser, getAllUsers, getUser } from '../controller/User.js';
import upload from '../middleware/multer.js';
import { admin } from '../middleware/admin.js';
const router = express.Router();
router.route("/create").post(upload.single("image"), createUser);
router.route("/all-users").get(admin, getAllUsers);
router.route("/:id").get(getUser);
export default router;
