import express from "express";
import statService from "../services/StatService";

const { getUserId } = require("../helpers/userInfo");
const router = express();

/**
 * @route GET /api/stats/daily-stats
 * @group Stats - Stats
 * @returns {object} 200 - An array of user info
 * @returns {Error}  400 - Unexpected error
 */
router.get("/daily-stats", async (req: any, res: any) => {
    const token: string = req.headers['authorization'];
    const userId: number = getUserId(token);

    var userDailyStats = await statService.getUserDailyInstagramStatsAsync(userId);

    res.json(userDailyStats);
});

/**
 * @route GET /api/stats/weekly-stats
 * @group Stats - Stats
 * @returns {object} 200 - An array of user info
 * @returns {Error}  400 - Unexpected error
 */
router.get("/weekly-stats", async (req: any, res: any) => {
    const token: string = req.headers['authorization'];
    const userId: number = getUserId(token);

    var userWeeklyStats = await statService.getUserWeeklyInstagramStatsAsync(userId);

    res.json(userWeeklyStats);
});

/**
 * @route GET /api/stats/monthly-stats
 * @group Stats - Stats
 * @returns {object} 200 - An array of user info
 * @returns {Error}  400 - Unexpected error
 */
router.get("/monthly-stats", async (req: any, res: any) => {
    const token: string = req.headers['authorization'];
    const userId: number = getUserId(token);

    var userMonthlyStats = await statService.getUserMonthlyInstagramStatsAsync(userId);

    res.json(userMonthlyStats);
});

/**
 * @route GET /api/stats/yearly-stats
 * @group Stats - Stats
 * @returns {object} 200 - An array of user info
 * @returns {Error}  400 - Unexpected error
 */
router.get("/yearly-stats", async (req: any, res: any) => {
    const token: string = req.headers['authorization'];
    const userId: number = getUserId(token);

    var userYearlyStats = await statService.getUserYearlyInstagramStatsAsync(userId);

    res.json(userYearlyStats);
});

module.exports = router;