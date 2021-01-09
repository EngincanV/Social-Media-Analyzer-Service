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
    const db = mysql.createConnection(dbConfig);

    const sqlCommand: string = `SELECT Date, FollowerCount FROM Stats WHERE userId = ${userId} and WEEKOFYEAR(date) = WEEKOFYEAR(NOW()) ORDER BY Date desc`;

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

                    const weeklyInstagramStats: any[] = [];

                    results.forEach(x => {
                        var date = x.Date.toLocaleString("tr").split(" ")[0];
                        var weekdayName: string = x.Date.toLocaleString("tr", { weekday: "short" });
                        var fullDate = date.concat(" ", weekdayName);

                        var isStatExist = weeklyInstagramStats.find(x => x.date === fullDate);
                        if(isStatExist === undefined) {
                            weeklyInstagramStats.push({ date: fullDate, followerCount: x.FollowerCount });
                        }
                    });
                    
                    resolve(weeklyInstagramStats);
                });
            }
            db.end((err: any) => {
                if (err) 
                    reject(err);
            });
        }) 
    }) 
}

const getUserYearlyInstagramStatsAsync = async (userId: number) => {
    const db = mysql.createConnection(dbConfig);

    const sqlCommand: string = `SELECT Date, FollowerCount FROM Stats WHERE userId = ${userId} and YEAR(date) = YEAR(NOW()) ORDER BY Date desc`;

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

                    const yearlyInstagramStats: any[] = [];

                    results.forEach(x => {
                        var date = new Date(x.Date.toISOString().split("T"));
                        var month = date.getMonth() + 1;
                        var year = date.getFullYear();
                        var fullDate = month.toString().concat(" ", year.toString());
                
                        var isStatExist = yearlyInstagramStats.find(x => x.date === fullDate);
                        if(isStatExist === undefined) {
                            yearlyInstagramStats.push({ date: fullDate, followerCount: x.FollowerCount });
                        }
                    });
                    
                    resolve(yearlyInstagramStats);
                });
            }
            db.end((err: any) => {
                if (err) 
                    reject(err);
            });
        }) 
    }) 
}

export default { saveUserInstagramStatsAsync, getUserDailyInstagramStatsAsync, getUserWeeklyInstagramStatsAsync, getUserYearlyInstagramStatsAsync };