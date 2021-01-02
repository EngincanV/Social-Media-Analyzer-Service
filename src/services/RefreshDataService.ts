import dbConfig from "../config/dbconfig";
const mysql = require("mysql");

async function refreshDataManagerAsync(userId: number) {
    const isRefreshDataExist = await isRefreshDataExistInCurrentDayAsync(userId);

    if(isRefreshDataExist) {
        const refreshDataCount = await decreaseRefreshDataCountAsync(userId);

        if(refreshDataCount === 0) {
            console.log("you don't any refresh count: " + refreshDataCount);
        }
    }

    else {
        await getRefreshDataCountByUserIdAsync(userId)
            .then(async (data) => {
                const dailyRefreshCount: any = data;
                await addRefreshDataAsync(userId, dailyRefreshCount)
                    .catch(err => console.log("err"));
            })
    }
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

    return new Promise((resolve: any, reject: any) => {
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
                        resolve(results[0].refreshCount);
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

    return new Promise((resolve: any, reject: any) => {
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
                        if(results.length <= 0) {
                            resolve(false);
                        }
    
                        resolve(true);
                    }
                });
                db.end((err: any) => {
                    if (err) 
                        reject(err);
                });
            }
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
                        
                        if(dailyRefreshCount > 0) {
                            dailyRefreshCount = dailyRefreshCount - 1;
    
                            await updateRefreshDataCountAsync(userId, currentDate, dailyRefreshCount);
                        }
    
                        resolve(dailyRefreshCount);
                    }
                    db.end((err: any) => {
                        if (err) 
                            reject(err);
                    });
                });
            }
        }) 
    })
    
}

async function updateRefreshDataCountAsync(userId: number, date: string, dailyRefreshCount: number) {
    const db = mysql.createConnection(dbConfig);
    
    const sqlCommand: string = `UPDATE refreshDatas SET dailyRefreshCount = ${dailyRefreshCount} WHERE userId = ${userId} and date = "${date}"`;

    return new Promise((resolve: any, reject: any) => {
        db.connect((err: any) => {
            if (err) {
                reject(err);
            }
            else {
                db.query(sqlCommand, (err: any, results: any) => {
                    if (err) {
                        reject(err);
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

module.exports = { refreshDataManagerAsync };