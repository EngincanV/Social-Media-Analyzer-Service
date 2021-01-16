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

    return await new Promise((resolve: any, reject: any) => {
        db.connect((err: any) => {
            if (err) {
                db.end((err: any) => {
                    if (err) 
                        reject(err);
                });

                reject(err);
            }
            else {
                db.query(sql, async (err: any, results: any) => {
                    if (err) {
                        db.end((err: any) => {
                            if (err) 
                                reject(err);
                        })

                        resolve({ success: false, message: 'Could not connect db' });
                    }
                    else if (results.length > 0) {
                        var hashedPassword: string = results[0].password;

                        const isSuccess: boolean = await comparePasswordAsync(password, hashedPassword);

                        if (isSuccess) {
                            const token: string = jwt.sign({
                                exp: Math.floor(Date.now() / 1000) + (60 * 60), //1 hour
                                data: { id: results[0].id, email: results[0].email }
                            }, jwtConfig.secretKey);

                            var { firstname, surname } = results[0];

                            db.end((err: any) => {
                                if (err) 
                                    reject(err);
                            })

                            resolve({ success: true, token, firstname, surname });
                        }

                        db.end((err: any) => {
                            if (err) reject(err);
                        })

                        resolve({ success: false, message: "Girdiğiniz şifre yanlış, lütfen şifrenizi doğru girdiğinizden emin olun." });
                    }
                    else {
                        db.end((err: any) => {
                            if (err)
                                reject(err);
                        })

                        resolve({ success: false, message: "Kullanıcı bulunamadı." });
                    }
                });
            }
        })
    });

}

const register = async (firstname: string, surname: string, email: string, password: string) => {
    const db = mysql.createConnection(dbConfig);

    var isUserExist: boolean = await isEmailExistAsync(email);
    var hashedPassword: string = await hashPasswordAsync(password);

    let sqlCommand: string = `INSERT INTO users (firstname, surname, email, password) VALUES ("${firstname}", "${surname}","${email}","${hashedPassword}")`;

    return await new Promise(async (resolve: any, reject: any) => {
        db.connect((err: any) => {
            if (err) {
                db.end((err: any) => {
                    if (err) reject(err);
                });

                reject(err);
            }
            else {
                if (isUserExist) {
                    db.end((err: any) => {
                        if (err) reject(err);
                    });

                    resolve({ success: false,  message: "Girmiş olduğunuz email adresi kullanılmaktadır, lütfen farklı bir email adresi giriniz." });
                }
                db.query(sqlCommand, async (err: any, results: any) => {
                    if (err) {
                        db.end((err: any) => {
                            if (err) reject(err);
                        });

                        resolve({ success: false, message: 'Bir hata oluştu lütfen daha sonra tekrar deneyiniz.' });
                    }
                    else {
                        var userId = results.insertId;
                        await addUserToSubscription(userId);

                        db.end((err: any) => {
                            if (err) reject(err);
                        });

                        resolve({ success: true, results });
                    }
                });
            }
        })
    });
}

const addProfilePhoto = async (userId: number, password: string, profilePhoto: string) => {
    const db = mysql.createConnection(dbConfig);

    return new Promise(async (resolve: any, reject: any) => {
        if (userId === 0) {
            resolve({ success: false, message: "Kullanıcı bulunamadı." });
        }
        
        const isPasswordCorrect: boolean = await isUserPasswordCorrectAsync(password, userId);

        if (!isPasswordCorrect) {
            resolve({ success: false, message: "Girmiş olduğunuz şifre doğru değildir." });
        }

        let sqlCommand: string = `UPDATE users SET profilePhoto = "${profilePhoto}" WHERE id = ${userId}`;

        db.connect((err: any) => {
            if (err) {
                db.end((err: any) => {
                    if (err) reject(err);
                });

                reject(err);
            }
            else {
                db.query(sqlCommand, (err: any, results: any) => {
                    if (err) {
                        db.end((err: any) => {
                            if (err) reject(err);
                        });

                        resolve({ success: false, message: "Profil fotoğrafı eklerken bir hata meydana geldi. Lütfen daha sonra tekrar deneyiniz." });
                    }
                    else {
                        db.end((err: any) => {
                            if (err) reject(err);
                        });

                        resolve({ success: true, results });
                    }
                });

            }
        })
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

async function isEmailExistAsync(email: string): Promise<any> {
    const db = mysql.createConnection(dbConfig);
    let command: string = `SELECT * FROM users WHERE email = "${email}"`;

    return await new Promise((resolve: any, reject: any) => {
        db.connect((err: any) => {
            if (err) {
                console.log('Cannot connect database');
                db.end((err: any) => {
                    if (err) reject(err);
                });

                reject(err);
            }

            db.query(command, (err: any, results: any) => {
                if (err)
                    reject(err);

                var isEmailExist: boolean = results.length > 0;
                db.end((err: any) => {
                    if (err) reject(err);
                });

                resolve(isEmailExist);
            });

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

const isUserPasswordCorrectAsync = async (password: string, userId: number): Promise<boolean> => {
    const db = mysql.createConnection(dbConfig);

    let sqlCommand: string = `SELECT * FROM users WHERE id = ${userId}`;

    return new Promise((resolve: any, reject: any) => {
        db.connect((err: any) => {
            if (err) {
                db.end((err: any) => {
                    if (err)
                        reject(err);
                });

                reject(err);
            }
            else {
                db.query(sqlCommand, async (err: any, results: any) => {
                    if (err) {
                        db.end((err: any) => {
                            if (err)
                                reject(err);
                        });

                        reject(err);
                    }

                    const hashedPassword = results[0].password;
                    const isUserPaswordCorrect: boolean = await comparePasswordAsync(password, hashedPassword);

                    db.end((err: any) => {
                        if (err)
                            reject(err);
                    });

                    resolve(isUserPaswordCorrect);
                });
            }
        });
    });
}

module.exports = { login, register, addProfilePhoto };
