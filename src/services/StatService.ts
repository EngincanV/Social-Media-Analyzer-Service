import dbConfig from "../config/dbconfig";
const { getUserInstagramStats } = require("./InstagramService");
const { formatDate } = require("../helpers/dateHelper");

const mysql = require("mysql");

const saveUserInstagramStatsAsync = async (userId: number, username: string, password: string) => {
    const db = mysql.createConnection(dbConfig);
    const userInfo = await getUserInstagramStats(username, password);
    const { followerCount, followingCount, postCount } = userInfo;
    
    const sqlCommand: string = `INSERT INTO stats (userId, FollowerCount, FollowingCount, PostCount) VALUES (${userId}, ${followerCount}, ${followingCount}, ${postCount})`;

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

const getUserDailyInstagramStatsAsync = async (userId: number) => {
    const db = mysql.createConnection(dbConfig);

    const sqlCommand: string = `SELECT Date, FollowerCount FROM Stats WHERE userId = ${userId} and DATE(Date) = CURDATE()`;

    return await new Promise((resolve: any, reject: any) => {
        db.connect((err: any) => {
            if (err) {
                reject(err);
            }
            else {
                db.query(sqlCommand, (err: any, results: any[]) => {
                    if (err) {
                        reject(err);
                    }

                    const dailyInstagramStats: any[] = [];

                    results.forEach(x => {
                        var date = x.Date.toISOString().split("T");
                        var fullDate: string = formatDate(x.Date);
                        var hour: number = parseInt(date[1].split(":"));
                        
                        var newDate = fullDate.concat(" ", hour.toString(), "-", (hour + 1).toString());
                        dailyInstagramStats.push({ date: newDate, followerCount: x.FollowerCount });
                    });
                    
                    resolve(dailyInstagramStats);
                });
            }
            db.end((err: any) => {
                if (err) 
                    reject(err);
            });
        }) 
    }) 
}

const getUserWeeklyInstagramStatsAsync = async (userId: number) => {
    
}

export default { saveUserInstagramStatsAsync, getUserDailyInstagramStatsAsync };