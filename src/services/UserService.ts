const mysql = require("mysql");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { addUserToSubscription } = require("../services/SubscriptionService");

import dbConfig from "../config/dbconfig";
import jwtConfig from "../config/jwt-secret-key";
import hashConfig from "../config/hashconfig";

const login = async (email: string, password: string) => {
    const db = mysql.createConnection(dbConfig);

    let sql: string = `SELECT * FROM users WHERE email = "${email}"`;

    return new Promise((resolve: any, reject: any) => {
        db.connect((err: any) => {
            if (err) {
                reject(err);
            }
            else {
                db.query(sql, async (err: any, results: any) => {
                    if (err) {
                        resolve({ success: false, message: 'Could not connect db' });
                    }
                    else if (results.length > 0) {
                        var hashedPassword: string = results[0].password;

                        const isSuccess: boolean = await comparePasswordAsync(password, hashedPassword);

                        if (isSuccess) {
                            const token: string = jwt.sign({
                                exp: Math.floor(Date.now() / 1000) + (60 * 60), //1 hour
                                data: { id: results[0].id, username: results[0].username }
                            }, jwtConfig.secretKey);

                            var { firstname, surname } = results[0];

                            resolve({ success: true, token, firstname, surname });
                        }

                        resolve({ success: false, message: "Given password is wrong" });
                    }
                    else {
                        resolve({ success: false, message: "User not found" });
                    }
                });
                db.end((err: any) => {
                    if (err) reject(err);
                })
            }
        })
    });

}

const register = async (firstname: string, surname: string, username: string, email: string, password: string) => {
    const db = mysql.createConnection(dbConfig);

    var isUserExist: boolean = isUsernameExist(username);
    var hashedPassword: string = await hashPasswordAsync(password);

    let sqlCommand: string = `INSERT INTO users (firstname, surname, username, email, password) VALUES ("${firstname}", "${surname}","${username}","${email}","${hashedPassword}")`;

    return new Promise((resolve: any, reject: any) => {
        db.connect((err: any) => {
            if (err) {
                reject(err);
            }
            else {
                if (isUserExist) {
                    resolve({ message: "Username already exist, please choose a new username" });
                }
                db.query(sqlCommand, (err: any, results: any) => {
                    if (err) {
                        resolve({ 'success': 'false', 'message': 'You must change username' });
                    }
                    else {
                        var userId = results.insertId;
                        addUserToSubscription(userId);

                        resolve(results);
                    }
                });
                db.end((err: any) => {
                    if (err) reject(err);
                });
            }
        })
    });
}

const addProfilePhoto = async (userId: number, profilePhoto: string) => {
    const db = mysql.createConnection(dbConfig);

    return new Promise((resolve: any, reject: any) => {
        if (userId === 0) {
            resolve({ status: false, message: "User could not found" });
        }

        let sqlCommand: string = `UPDATE users SET profilePhoto = "${profilePhoto}" WHERE id = ${userId}`;

        db.connect((err: any) => {
            if (err) {
                reject(err);
            }
            else {
                db.query(sqlCommand, (err: any, results: any) => {
                    if (err) {
                        resolve({ success: false, message: "Something went wrong when tried to add profile photo" });
                    }
                    else {
                        resolve(results);
                    }
                });
                db.end((err: any) => {
                    if (err) reject(err);
                });
            }
        })
    });
}

const comparePasswordAsync = async (password: string, hash: string): Promise<boolean> => {
    try {
        const isPasswordSame: boolean = await new Promise((resolve, reject) => {
            bcrypt.compare(password, hash, function (err: any, result: any) {
                if (err) reject(err);

                resolve(result);
            });
        });

        return isPasswordSame;

    } catch (error) {
        throw error;
    }
}

function isUsernameExist(username: string): any {
    const db = mysql.createConnection(dbConfig);
    let command: string = `SELECT * FROM users WHERE username = "${username}"`;

    db.connect((err: any) => {
        if (err) {
            console.log('Cannot connect database');
            throw err;
        }

        db.query(command, (err: any, results: any) => {
            if (err)
                throw err;

            var isUsernameExist: boolean = results.length > 0;

            return isUsernameExist;
        });
    });
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

module.exports = { login, register, addProfilePhoto };