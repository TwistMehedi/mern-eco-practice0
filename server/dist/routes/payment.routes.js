import express from 'express';
import { allCoupon, applyDisscount, deleteCoupon, newCoupon } from '../controller/payment.controller.js';
import { admin } from '../middleware/admin.js';
const router = express.Router();
router.route("/new").post(admin, newCoupon);
router.route("/disscount").get(applyDisscount);
router.route("/coupons").get(allCoupon);
router.route("/delete/coupon/:id").delete(admin, deleteCoupon);
export default router;
