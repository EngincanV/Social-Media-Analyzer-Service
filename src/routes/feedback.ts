import express from "express";
const { getUserId } = require("../helpers/userInfo");

const router = express();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

const { addNewFeedback } = require("../services/FeedbackService");

/**
 * @route POST /api/feedback/add
 * @group Feedback - Operations about user
 * @param {string} topic
 * @param {string} message
 * @returns {object} 200 - An array of user info
 * @returns {Error}  400 - Unexpected error
 */
router.post("/add", async (req: any, res: any) => {
    const token: string = req.headers['authorization'];
    const userId: number = getUserId(token);
    const { topic, message } = req.body;

    if (userId === 0) {
        res.end({ success: false, message: "Kullanıcı bulunamadı." });
    }

    var feedback: object = addNewFeedback(userId, topic, message);

    res.json(feedback);
});

module.exports = router;