import jwtConfig from "../config/jwt-secret-key";
const pool = require("../config/dbConnection");

const getSuggesstions = async () => {
    let sql: string = `SELECT title, description, photoUrl FROM Suggestions`;
    
    pool.getConnection((err: any, connection: any) => {
        if (err) {
            throw err;
        }
        else {
            connection.query(sql, async (err: any, results: any) => {
                if (err || results.length == 0) {
                    connection.release();

                    return { success: false, message: 'Veritabanına bağlanırken bir sorunla karşılaşıldı. Lütfen daha sonra tekrar deneyiniz.' };
                }
                else {
                    connection.release();

                    return { success: true, results: results };
                }
            });
        }
    });
}

module.exports = { getSuggesstions };