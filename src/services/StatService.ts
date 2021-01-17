const { getUserInstagramStats } = require("./InstagramService");
const { formatDate } = require("../helpers/dateHelper");

const pool = require("../config/dbConnection");

const saveUserInstagramStatsAsync = async (userId: number, username: string, password: string) => {
    const userInfo = await getUserInstagramStats(username, password);
    const { followerCount, followingCount, postCount } = userInfo;

    const sqlCommand: string = `INSERT INTO stats (userId, FollowerCount, FollowingCount, PostCount) VALUES (${userId}, ${followerCount}, ${followingCount}, ${postCount})`;

    return await new Promise((resolve: any, reject: any) => {
        pool.getConnection((err: any, connection: any) => {
            if (err) {
                reject(err);
            }
            else {
                connection.query(sqlCommand, (err: any, results: any) => {
                    if (err) {
                        connection.release();
                        reject(err);
                    }

                    resolve(results);
                });
            }

            connection.release();
        })
    })
}

const getUserDailyInstagramStatsAsync = async (userId: number) => {
    const sqlCommand: string = `SELECT Date, FollowerCount FROM Stats WHERE userId = ${userId} and DATE(Date) = CURDATE()`;

    return await new Promise((resolve: any, reject: any) => {
        pool.getConnection((err: any, connection: any) => {
            if (err) {
                reject(err);
            }
            else {
                connection.query(sqlCommand, (err: any, results: any[]) => {
                    if (err) {
                        connection.release();
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

                    resolve({ success: true, dailyInstagramStats });
                });
            }

            connection.release();
        })
    })
}

const getUserWeeklyInstagramStatsAsync = async (userId: number) => {
    const sqlCommand: string = `SELECT Date, FollowerCount FROM Stats WHERE userId = ${userId} and WEEKOFYEAR(date) = WEEKOFYEAR(NOW()) ORDER BY Date desc`;

    return await new Promise((resolve: any, reject: any) => {
        pool.getConnection((err: any, connection: any) => {
            if (err) {
                reject(err);
            }
            else {
                connection.query(sqlCommand, (err: any, results: any[]) => {
                    if (err) {
                        connection.release();
                        reject(err);
                    }

                    const weeklyInstagramStats: any[] = [];

                    results.forEach(x => {
                        var date = x.Date.toLocaleString("tr").split(" ")[0];
                        var weekdayName: string = x.Date.toLocaleString("tr", { weekday: "short" });
                        var fullDate = date.concat(" ", weekdayName);

                        var isStatExist = weeklyInstagramStats.find(x => x.date === fullDate);
                        if (isStatExist === undefined) {
                            weeklyInstagramStats.push({ date: fullDate, followerCount: x.FollowerCount });
                        }
                    });

                    resolve({ success: true, weeklyInstagramStats });
                });
            }
            
            connection.release();
        })
    })
}

const getUserMonthlyInstagramStatsAsync = async (userId: number) => {
    const sqlCommand: string = `SELECT FollowerCount, WEEK(date) as Week FROM Stats WHERE userId = ${userId} and MONTH(date) = MONTH(NOW()) ORDER BY Date desc`;

    return await new Promise((resolve: any, reject: any) => {
        pool.getConnection((err: any, connection: any) => {
            if (err) {
                reject(err);
            }
            else {
                connection.query(sqlCommand, (err: any, results: any[]) => {
                    if (err) {
                        connection.release();
                        reject(err);
                    }

                    const monthlyInstagramStats: any[] = [];

                    results.forEach(x => {
                        var week = `${x.Week}.Hafta`;

                        var isStatExist = monthlyInstagramStats.find(y => y.week === week);
                        if (isStatExist === undefined) {
                            monthlyInstagramStats.push({ week: week, followerCount: x.FollowerCount });
                        }
                    });

                    resolve({ success: true, monthlyInstagramStats });
                });
            }
            
            connection.release();
        })
    })
}

const getUserYearlyInstagramStatsAsync = async (userId: number) => {
    const sqlCommand: string = `SELECT Date, FollowerCount FROM Stats WHERE userId = ${userId} and YEAR(date) = YEAR(NOW()) ORDER BY Date desc`;

    return await new Promise((resolve: any, reject: any) => {
        pool.getConnection((err: any, connection: any) => {
            if (err) {
                reject(err);
            }
            else {
                connection.query(sqlCommand, (err: any, results: any[]) => {
                    if (err) {
                        connection.release();
                        reject(err);
                    }

                    const yearlyInstagramStats: any[] = [];

                    results.forEach(x => {
                        var date = new Date(x.Date.toISOString().split("T"));
                        var month = date.getMonth() + 1;
                        var year = date.getFullYear();
                        var fullDate = month.toString().concat(" ", year.toString());

                        var isStatExist = yearlyInstagramStats.find(x => x.date === fullDate);
                        if (isStatExist === undefined) {
                            yearlyInstagramStats.push({ date: fullDate, followerCount: x.FollowerCount });
                        }
                    });

                    resolve({ success: true, yearlyInstagramStats });
                });
            }
            
            connection.release();
        })
    })
}

export default { saveUserInstagramStatsAsync, getUserDailyInstagramStatsAsync, getUserWeeklyInstagramStatsAsync, getUserMonthlyInstagramStatsAsync, getUserYearlyInstagramStatsAsync };