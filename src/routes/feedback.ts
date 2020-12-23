import express from "express";
const mysql = require("mysql");

import dbConfig from "../config/dbconfig";
const { getUserId } = require("../helpers/userInfo");

const router = express();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.post("/add", async (req: any, res: any) => {
    const db = mysql.createConnection(dbConfig);
    const token: string = req.headers['authorization'];
    const userId: number = getUserId(token);

    if (userId === 0) {
        res.end({ status: false });
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
                    res.send(results);
                }
            });

            db.end((err: any) => {
                if (err) throw err;
            });
        }
    });

});

module.exports = router;