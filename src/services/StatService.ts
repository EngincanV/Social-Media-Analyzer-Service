import dbConfig from "../config/dbconfig";
const { getUserInstagramStats } = require("./InstagramService");

const mysql = require("mysql");

const saveUserInstagramStatsAsync = async (userId: number, username: string, password: string) => {
    const db = mysql.createConnection(dbConfig);
    const followerCount = await getUserInstagramStats(username, password)
    
    const sqlCommand: string = `INSERT INTO stats (userId, FollowerCount) VALUES (${userId}, ${followerCount})`;

    return await new Promise((resolve: any, reject: any) => {
        db.connect((err: any) => {
            if (err) {
                reject(err);
            }
            else {
                db.query(sqlCommand, (err: any, results: any) => {
                    if (err) {
                        reject(err);
                    }

                    resolve(results);
                });
            }
            db.end((err: any) => {
                if (err) 
                    reject(err);
            });
        }) 
    }) 
}

export default { saveUserInstagramStatsAsync };