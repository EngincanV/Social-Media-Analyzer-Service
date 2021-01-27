import jwtConfig from "../config/jwt-secret-key";
const pool = require("../config/dbConnection");

const addNewFeedback = (userId: number, topic: string, message: string): any => {
    pool.getConnection((err: any, connection: any) => {
        if (err) {
            throw err;
        }
        else {
            let sqlCommand: string = `INSERT INTO feedbacks (userId, topic, message) VALUES ("${userId}", "${topic}","${message}")`;

            connection.query(sqlCommand, (err: any, results: any) => {
                if (err) {
                    connection.release();

                    throw err;
                }
                else {
                    connection.release();

                    return { success: true, results };
                }
            });
        }
    });
}

module.exports = { addNewFeedback };