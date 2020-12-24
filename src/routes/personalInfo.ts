import express from "express";
const mysql = require("mysql");
const bcrypt = require("bcrypt");

import dbConfig from "../config/dbconfig";
import hashConfig from "../config/hashconfig";
const { getUserId } = require("../helpers/userInfo");

const router = express();

/**
 * @route POST /personal-info/change-password
 * @group Personal Info - Personal Info
 * @param {string} password
 * @param {string} newPassword
 * @returns {object} 200 - An array of user info
 * @returns {Error}  400 - Unexpected error
 */
router.post("/change-password", async (req: any, res: any) => {
    const token: string = req.headers['authorization'];
    const userId: number = getUserId(token);
    const { password, newPassword } = req.body;

    if (userId === 0) {
        res.end({ status: false, message: "User could not found." });
    }

    const isPasswordCorrect: boolean = await isUserPasswordCorrectAsync(password, userId);

    if (!isPasswordCorrect) {
        res.json({ status: false, message: "Wrong password typed!" });
    }

    await changePasswordAsync(newPassword, userId)
        .then(() => res.json({ status: true, message: "User password has been changed successfully." }))
        .catch((err) => res.json({ status: false, error: err }));

});

const isUserPasswordCorrectAsync = async (password: string, userId: number): Promise<boolean> => {
    const db = mysql.createConnection(dbConfig);

    let sqlCommand: string = `SELECT * FROM users WHERE id = ${userId}`;

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

                    const hashedPassword = results[0].password;
                    const isUserPaswordCorrect: boolean = await comparePasswordAsync(password, hashedPassword);

                    resolve(isUserPaswordCorrect);
                });

                db.end((err: any) => {
                    if (err)
                     reject(err);
                });
            }
        });
    });
}

const changePasswordAsync = (password: string, userId: number): Promise<any> => {
    const db = mysql.createConnection(dbConfig);

    return new Promise((resolve: any, reject: any) => {
        db.connect(async (err: any) => {
            if (err)
                reject(err);

            let hashPassword: string = await hashPasswordAsync(password);
            let sqlCommand: string = `UPDATE users SET password = "${hashPassword}" WHERE id=${userId}`;

            db.query(sqlCommand, async (err: any, results: any) => {
                if (err)
                    reject(err);

                resolve(results);
            });

            db.end((err: any) => {
                if (err)
                    reject(err);
            });
        });
    });
}

const comparePasswordAsync = async (password: string, hash: string): Promise<boolean> => {
    try {
        const isPasswordSame: boolean = await new Promise((resolve, reject) => {
            bcrypt.compare(password, hash, function (err: any, result: any) {
                if (err) 
                    reject(err);

                resolve(result);  
            });
        });

        return isPasswordSame;

    } catch (error) {
        throw error;
    }
}

const hashPasswordAsync = async (password: string): Promise<any> => {
    const { saltRounds } = hashConfig;

    const hashedPassword = await new Promise((resolve, reject) => {
        bcrypt.hash(password, saltRounds, (err: any, hash: any) => {
            if (err) reject(err);

            resolve(hash);
        });
    });

    return hashedPassword;
}

module.exports = router;