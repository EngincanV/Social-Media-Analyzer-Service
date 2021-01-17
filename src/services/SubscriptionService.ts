const mysql = require("mysql");
import dbConfig from "../config/dbconfig";

const pool = require("../config/dbConnection");

//enums
const SubscriptionTypes = require("../constants/SubscriptionType");

async function addUserToSubscription(userId: number): Promise<any> {
    var date = new Date();
    var subscriptionStartDate = date.toISOString().split("T")[0];
    date.setMonth(date.getMonth() + 6);

    var subscriptionEndDate: string = date.toISOString().split("T")[0];
    var subscriptionPrice: number = 0; //await getSubscriptionPriceById(SubscriptionTypes.Free)
    var subscriptionMonth = 6;
    var totalAmount = subscriptionPrice * subscriptionMonth;

    let sqlCommand: string = `INSERT INTO subscriptions (userId, subscriptionTypeId, subscriptionStartDate, subscriptionEndDate, subscriptionMonthCount, totalAmount) VALUES (${userId}, ${SubscriptionTypes.Free}, "${subscriptionStartDate}", "${subscriptionEndDate}", ${subscriptionMonth}, ${totalAmount})`;

    return await new Promise((resolve: any, reject: any) => {
        pool.getConnection((err: any, connection: any) => {
            if (err) {
                reject(err);
            }
    
            connection.query(sqlCommand, (err: any, results: any) => {
                if (err) {
                    connection.release();
                    reject(err);
                }
            });

            resolve({ success: true, message: "Başarılı." });
        });
    });
}

async function getSubscriptionPriceById(subcriptionId: number): Promise<number> {
    const db = mysql.createConnection(dbConfig);

    let sqlCommand: string = `SELECT price FROM subscriptionTypes WHERE id = ${subcriptionId}`;

    return new Promise((resolve: any, reject: any) => {
        db.connect((err: any) => {
            if (err) {
                console.log("Cannot connect db");
                db.end((err: any) => {
                    if (err)
                        reject(err);
                });
                
                reject(err);
            }
    
            db.query(sqlCommand, (err: any, results: any) => {
                if (err) {
                    db.end((err: any) => {
                        if (err)
                            reject(err);
                    });

                    reject(err);
                }
    
                const price = results[0].price;
    
                db.end((err: any) => {
                    if (err)
                        reject(err);
                });

                resolve(price);
            });
        });
    
        resolve(0);
    })
}

module.exports = { addUserToSubscription };