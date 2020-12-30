const mysql = require("mysql");
import dbConfig from "../config/dbconfig";

//enums
const SubscriptionTypes = require("../constants/SubscriptionType");

function addUserToSubscription(userId: number) {
    const db = mysql.createConnection(dbConfig);

    var date = new Date();
    var subscriptionStartDate = date.toISOString().split("T")[0];
    date.setMonth(date.getMonth() + 6);

    var subscriptionEndDate: string = date.toISOString().split("T")[0];
    var subscriptionPrice: number = getSubscriptionPriceById(SubscriptionTypes.Free);
    var subscriptionMonth = 6; //TODO: get this from user, after MVP?
    var totalAmount = subscriptionPrice * subscriptionMonth;

    let sqlCommand: string = `INSERT INTO subscriptions (userId, subscriptionTypeId, subscriptionStartDate, subscriptionEndDate, subscriptionMonthCount, totalAmount) VALUES (${userId}, ${SubscriptionTypes.Free}, "${subscriptionStartDate}", "${subscriptionEndDate}", ${subscriptionMonth}, ${totalAmount})`;

    db.connect((err: any) => {
        if (err) {
            console.log('Cannot connect database');
            throw err;
        }

        db.query(sqlCommand, (err: any, results: any) => {
            if (err)
                throw err;
        });
    });
}

function getSubscriptionPriceById(subcriptionId: number): number {
    const db = mysql.createConnection(dbConfig);

    let sqlCommand: string = `SELECT price FROM subscriptionTypes WHERE id = ${subcriptionId}`;

    db.connect((err: any) => {
        if (err) {
            console.log("Cannot connect db");
            throw err;
        }

        db.query(sqlCommand, (err: any, results: any) => {
            if (err)
                throw err;

            const price = results[0].price;

            return price;
        });
    });

    return 0;
}

module.exports = { addUserToSubscription };