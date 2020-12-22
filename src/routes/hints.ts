import express from "express";
const mysql = require("mysql"); 

import dbConfig from "../config/dbconfig";

const router = express();

/**
 * @route GET /get-random-hint
 * @group Hints - Hints
 * @returns {object} 200 - An array of user info
 * @returns {Error}  400 - Unexpected error
 */
router.get("/get-random-hint", async (req: any, res: any) => {
    const db = mysql.createConnection(dbConfig);

    let sql: string = `SELECT * FROM Hints ORDER BY RAND() LIMIT 1`;
    
    db.connect((err: any) => {
        if (err) {
            throw err;
        }
        else {
            db.query(sql, async (err: any, results: any) => {
                if (err || results.length == 0) {
                    res.send({ 'success': 'false', 'message': 'Could not connect db' });
                }
                else {
                    res.send(results[0]);
                }
            });
        }
    });
});

module.exports = router;