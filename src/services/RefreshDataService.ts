import dbConfig from "../config/dbconfig";
import statService from "./StatService";
const mysql = require("mysql");

async function refreshDataManagerAsync(userId: number, igUsername: string, igPassword: string) {
    const isRefreshDataExist = await isRefreshDataExistInCurrentDayAsync(userId);

    if (isRefreshDataExist) {
        const refreshDataCount = await decreaseRefreshDataCountAsync(userId);

        if (refreshDataCount === 0) {
            console.log("you don't any refresh count: " + refreshDataCount);
            return;
        }
    }

    else {
        await getRefreshDataCountByUserIdAsync(userId)
            .then(async (data) => {
                const dailyRefreshCount: any = data;
                await addRefreshDataAsync(userId, dailyRefreshCount)
                    .catch(err => console.log("err"));
            });
    }

    await statService.saveUserInstagramStatsAsync(userId, igUsername, igPassword);
}

async function addRefreshDataAsync(userId: number, dailyRefreshCount: number) {
    const db = mysql.createConnection(dbConfig);
    var date = new Date();
    var currentDate = date.toISOString().split("T")[0];

    const sqlCommand: string = `INSERT INTO refreshDatas (userId, dailyRefreshCount, date) VALUES (${userId}, ${dailyRefreshCount}, "${currentDate}")`;

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

async function getRefreshDataCountByUserIdAsync(userId: number) {
    const db = mysql.createConnection(dbConfig);
    const sqlCommand: string = `SELECT st.refreshCount FROM subscriptions s inner join subscriptiontypes st on s.subscriptionTypeId = st.id WHERE s.userId = ${userId}`;

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
                    else {
                        console.log(results)
                        const refreshCount = results[0].refreshCount;
                        console.log(refreshCount);

                        resolve(refreshCount);
                    }
                });
                db.end((err: any) => {
                    if (err)
                        reject(err);
                });
            }
        })
    });
}

async function isRefreshDataExistInCurrentDayAsync(userId: number) {
    const db = mysql.createConnection(dbConfig);
    var date = new Date();
    var currentDate = date.toISOString().split("T")[0];

    const sqlCommand: string = `SELECT * FROM refreshDatas WHERE userId = ${userId} and date = "${currentDate}"`;

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
                    else {
                        console.log("is record exist: " + results.length)
                        if (results.length <= 0) {
                            resolve(false);
                        }

                        resolve(true);
                        return;
                    }
                });
            }
            db.end((err: any) => {
                if (err)
                    reject(err);
            });
        })
    })
}

async function decreaseRefreshDataCountAsync(userId: number) {
    const db = mysql.createConnection(dbConfig);
    var date = new Date();
    var currentDate = date.toISOString().split("T")[0];

    const sqlCommand: string = `SELECT dailyRefreshCount FROM refreshDatas WHERE userId = ${userId} and date = "${currentDate}"`;

    return new Promise((resolve: any, reject: any) => {
        db.connect((err: any) => {
            if (err) {
                reject(err);
            }
            else {
                db.query(sqlCommand, async (err: any, results: any) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        var dailyRefreshCount = results[0].dailyRefreshCount;

                        if (dailyRefreshCount > 0) {
                            dailyRefreshCount = dailyRefreshCount - 1;

                            await updateRefreshDataCountAsync(userId, currentDate, dailyRefreshCount);
                        }

                        resolve(dailyRefreshCount);
                    }
                });
            }

            db.end((err: any) => {
                if (err)
                    reject(err);
            });
        })
    })

}

function updateRefreshDataCountAsync(userId: number, date: string, dailyRefreshCount: number) {
    const db = mysql.createConnection(dbConfig);

    const sqlCommand: string = `UPDATE refreshDatas SET dailyRefreshCount = ${dailyRefreshCount} WHERE userId = ${userId} and date = "${date}"`;

    db.connect((err: any) => {
        if (err) {
            throw err;
        }
        else {
            db.query(sqlCommand, (err: any, results: any) => {
                if (err) {
                    throw err;
                }
            });
        }
    })
}

export default { refreshDataManagerAsync };