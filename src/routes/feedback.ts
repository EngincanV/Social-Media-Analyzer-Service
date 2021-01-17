import express from "express";
const { getUserId } = require("../helpers/userInfo");
const pool = require("../config/dbConnection");

const router = express();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

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

    if (userId === 0) {
        res.end({ success: false, message: "Kullanıcı bulunamadı." });
    }

    pool.getConnection((err: any, connection: any) => {
        if (err) {
            throw err;
        }
        else {
            const { topic, message } = req.body;
            let sqlCommand: string = `INSERT INTO feedbacks (userId, topic, message) VALUES ("${userId}", "${topic}","${message}")`;

            connection.query(sqlCommand, (err: any, results: any) => {
                if (err) {
                    connection.release();
                    throw err;
                }
                else {
                    res.send({ success: true, results });
                    connection.release();
                }
            });
        }
    });

});

module.exports = router;