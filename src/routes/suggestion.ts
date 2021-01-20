import express from "express";

const pool = require("../config/dbConnection");
const router = express();

/**
 * @route GET /suggesstion/list
 * @group Suggesstions - Suggesstions
 * @returns {object} 200 - An array of user info
 * @returns {Error}  400 - Unexpected error
 */
router.get("/list", async (req: any, res: any) => {
    let sql: string = `SELECT title, description, photoUrl FROM Suggestions`;
    
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
                    res.send({ success: true, results: results });
                    connection.release();
                }
            });
        }
    });
})

module.exports = router;