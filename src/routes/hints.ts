import express from "express";

const pool = require("../config/dbConnection");
const router = express();

/**
 * @route GET /get-random-hint
 * @group Hints - Hints
 * @returns {object} 200 - An array of user info
 * @returns {Error}  400 - Unexpected error
 */
router.get("/get-random-hint", async (req: any, res: any) => {
    let sql: string = `SELECT * FROM Hints ORDER BY RAND() LIMIT 1`;
    
    pool.getConnection((err: any, connection: any) => {
        if (err) {
            throw err;
        }
        else {
            connection.query(sql, async (err: any, results: any) => {
                if (err || results.length == 0) {
                    connection.release();
                    res.send({ success: false, message: 'Veritabanına bağlanırken bir sorunla karşılaşıldı. Lütfen daha sonra tekrar deneyiniz.' });
                }
                else {
                    res.send({ success: true, results: results[0] });
                    connection.release();
                }
            });
        }
    });
});

module.exports = router;