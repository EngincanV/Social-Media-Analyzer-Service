import express from "express";
const mysql = require("mysql");

import dbConfig from "../config/dbconfig";
const { getUserId } = require("../helpers/userInfo");

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
    const db = mysql.createConnection(dbConfig);
    const token: string = req.headers['authorization'];
    const userId: number = getUserId(token);

    if (userId === 0) {
        res.end({ success: false, message: "Kullanıcı bulunamadı." });
    }

    db.connect((err: any) => {
        if (err) {
            throw err;
        }
        else {
            const { topic, message } = req.body;
            let sqlCommand: string = `INSERT INTO feedbacks (userId, topic, message) VALUES ("${userId}", "${topic}","${message}")`;

            db.query(sqlCommand, (err: any, results: any) => {
                if (err) {
                    throw err;
                }
                else {
                    res.send({ success: true, results });
                }
            });

            db.end((err: any) => {
                if (err) throw err;
            });
        }
    });

});

module.exports = router;