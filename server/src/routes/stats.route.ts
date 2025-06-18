import express from 'express';
import { admin } from '../middleware/admin.js';
import { getBarCharts, getDashbordStats, getLineCharts, getPieCharts } from '../controller/stats.controller.js';

const router = express.Router();

router.route("/stats").get(admin,getDashbordStats)

router.route("/pie").get(admin,getPieCharts)
router.route("/bar").get(admin,getBarCharts)
router.route("/line").get(admin,getLineCharts)

export default router;
