import express from "express";

const router = express();
const { getRandomHint } = require("../services/HintService");

/**
 * @route GET /get-random-hint
 * @group Hints - Hints
 * @returns {object} 200 - An array of user info
 * @returns {Error}  400 - Unexpected error
 */
router.get("/get-random-hint", async (req: any, res: any) => {
    var hint = getRandomHint();

    res.json(hint);
});

module.exports = router;