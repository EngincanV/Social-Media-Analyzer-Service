import express from "express";

const router = express();

const { getSuggesstions } = require("../services/SuggesstionService");

/**
 * @route GET /suggesstion/list
 * @group Suggesstions - Suggesstions
 * @returns {object} 200 - An array of user info
 * @returns {Error}  400 - Unexpected error
 */
router.get("/list", async (req: any, res: any) => {
    var response = getSuggesstions();

    res.json(response);
})

module.exports = router;