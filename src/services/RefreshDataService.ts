import statService from "./StatService";

const pool = require("../config/dbConnection");

async function refreshDataManagerAsync(userId: number, igUsername: string, igPassword: string) {
    const isRefreshDataExist = await isRefreshDataExistInCurrentDayAsync(userId);
console.log("exist: " + isRefreshDataExist);

    if (isRefreshDataExist) {
        const refreshDataCount = await decreaseRefreshDataCountAsync(userId);
console.log(refreshDataCount)
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
    var date = new Date();
    var currentDate = date.toISOString().split("T")[0];

    const sqlCommand: string = `INSERT INTO refreshDatas (userId, dailyRefreshCount, date) VALUES (${userId}, ${dailyRefreshCount}, "${currentDate}")`;

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
        })
    })
}

async function getRefreshDataCountByUserIdAsync(userId: number) {
    const sqlCommand: string = `SELECT st.refreshCount FROM subscriptions s inner join subscriptiontypes st on s.subscriptionTypeId = st.id WHERE s.userId = ${userId}`;

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
                    else {
                        const refreshCount = results[0].refreshCount;

                        resolve(refreshCount);
                    }
                });
            }
        })
    });
}

async function isRefreshDataExistInCurrentDayAsync(userId: number) {
    var date = new Date();
    var currentDate = date.toISOString().split("T")[0];

    const sqlCommand: string = `SELECT * FROM refreshDatas WHERE userId = ${userId} and date = "${currentDate}"`;

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
                    else {
                        if (results.length <= 0) {
                            resolve(false);
                        }

                        resolve(true);
                        return;
                    }
                });
            }
        })
    })
}

async function decreaseRefreshDataCountAsync(userId: number) {
    var date = new Date();
    var currentDate = date.toISOString().split("T")[0];

    const sqlCommand: string = `SELECT dailyRefreshCount FROM refreshDatas WHERE userId = ${userId} and date = "${currentDate}"`;

    return await new Promise((resolve: any, reject: any) => {
        pool.getConnection((err: any, connection: any) => {
            if (err) {
                reject(err);
            }
            else {
                connection.query(sqlCommand, async (err: any, results: any) => {
                    if (err) {
                        connection.release();
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

                    connection.release();
                });
            }
        })
    })

}

async function updateRefreshDataCountAsync(userId: number, date: string, dailyRefreshCount: number) {
    const sqlCommand: string = `UPDATE refreshDatas SET dailyRefreshCount = ${dailyRefreshCount} WHERE userId = ${userId} and date = "${date}"`;

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
                });

                resolve(true);
            }
        })
    });
}

export default { refreshDataManagerAsync };