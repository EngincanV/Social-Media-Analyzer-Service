import express from "express";
const mysql = require("mysql");
const bcrypt = require("bcrypt");

import dbConfig from "../config/dbconfig";
import hashConfig from "../config/hashconfig";
const { getUserId, getUserEmail } = require("../helpers/userInfo");

const router = express();

/**
 * @route GET /api/personal-info/
 * @group Personal Info - Personal Info
 * @returns {object} 200 - An array of user info
 * @returns {Error}  400 - Unexpected error
 */
router.get("/", async (req: any, res: any) => {
    const token: string = req.headers['authorization'];
    const userId: number = getUserId(token);

    if (userId === 0) {
        res.end({ success: false, message: "Kullanıcı bulunamadı." });
    }

    await getUserInfoByUserIdAsync(userId)
        .then((data: any) => {
            res.json({ success: true, userInfo: data })
        })
        .catch((err) => res.json({ success: false, error: err }));
});

/**
 * @route GET /api/personal-info/nameSurname
 * @group Personal Info - Personal Info
 * @returns {object} 200 - An array of user info
 * @returns {Error}  400 - Unexpected error
 */
router.get("/nameSurname", async (req: any, res: any) => {
    const token: string = req.headers['authorization'];
    const userId: number = getUserId(token);

    if (userId === 0) {
        res.end({ success: false, message: "Kullanıcı bulunamadı." });
    }

    await getUserInfoByUserIdAsync(userId)
        .then((data: any) => {
            const { firstname, surname } = data;
            res.json({ success: true, firstname, surname });
        })
        .catch((err) => res.json({ success: false, error: err }));
});

/**
 * @route POST /api/personal-info/change-password
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
        res.end({ success: false, message: "Kullanıcı bulunamadı." });
    }

    const isPasswordCorrect: boolean = await isUserPasswordCorrectAsync(password, userId);

    if (!isPasswordCorrect) {
        res.json({ success: false, message: "Girmiş olduğunuz şifre yanlış. Lütfen şifreyi doğru giriniz." });
    }

    await changePasswordAsync(newPassword, userId)
        .then(() => res.json({ success: true, message: "Şifreniz başarıyla değiştirilmiştir." }))
        .catch((err) => res.json({ success: false, error: err }));
});

/**
 * @route POST /api/personal-info/edit
 * @group Personal Info - Personal Info
 * @param {string} password
 * @param {string} firstname
 * @param {string} surname
 * @param {string} email
 * @returns {object} 200 - An array of user info
 * @returns {Error}  400 - Unexpected error
 */
router.post("/edit", async (req: any, res: any) => {
    const token: string = req.headers['authorization'];
    const userId: number = getUserId(token);
    const currentEmail: string = getUserEmail(token);
    const { password, firstname, surname, email } = req.body;

    if (userId === 0) {
        res.end({ success: false, message: "Kullanıcı bulunamadı." });
    }

    const isPasswordCorrect: boolean = await isUserPasswordCorrectAsync(password, userId);

    if (!isPasswordCorrect) {
        res.json({ success: false, message: "Girmiş olduğunuz şifre doğru değildir." });
    }
    
    if (currentEmail !== email) {
        var isEmailInUse: boolean = await isEmailExistAsync(email);

        if (isEmailInUse) {
            res.json({ success: false, message: "Girmiş olduğunuz email adresi başka bir kullanıcı tarafından kullanılmaktadır. Lütfen farklı bir email adresi giriniz." });
        }
    }

    await updateUserInfosAsync(firstname, surname, email, userId)
        .then(() => res.json({ success: true, message: "Kullanıcı bilgileri başarılı bir şekilde değiştirilmiştir." }))
        .catch(err => res.json({ success: false, error: err }));
});

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

const changePasswordAsync = async (password: string, userId: number): Promise<any> => {
    const db = mysql.createConnection(dbConfig);

    return await new Promise((resolve: any, reject: any) => {
        db.connect(async (err: any) => {
            if (err) {
                db.end((err: any) => {
                    if (err)
                        reject(err);
                });

                reject(err);
            }

            let hashPassword: string = await hashPasswordAsync(password);
            let sqlCommand: string = `UPDATE users SET password = "${hashPassword}" WHERE id=${userId}`;

            db.query(sqlCommand, async (err: any, results: any) => {
                if (err) {
                    db.end((err: any) => {
                        if (err)
                            reject(err);
                    });

                    reject(err);
                }

                db.end((err: any) => {
                    if (err)
                        reject(err);
                });

                resolve(results);
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

const updateUserInfosAsync = async (firstname: string, surname: string, email: string, userId: number) => {
    const db = mysql.createConnection(dbConfig);

    return await new Promise((resolve: any, reject: any) => {
        db.connect(async (err: any) => {
            if (err) {
                db.end((err: any) => {
                    if (err)
                        reject(err);
                });

                reject(err);
            }

            let sqlCommand: string = `UPDATE users SET firstname = "${firstname}", surname = "${surname}", email = "${email}" WHERE id=${userId}`;

            db.query(sqlCommand, async (err: any, results: any) => {
                if (err) {
                    db.end((err: any) => {
                        if (err)
                            reject(err);
                    });

                    reject(err);
                }

                db.end((err: any) => {
                    if (err)
                        reject(err);
                });

                resolve(results);
            });
        });
    });
}

const getUserInfoByUserIdAsync = async (userId: number) => {
    const db = mysql.createConnection(dbConfig);

    return await new Promise((resolve: any, reject: any) => {
        db.connect(async (err: any) => {
            if (err) {
                db.end((err: any) => {
                    if (err)
                        reject(err);
                });

                reject(err);
            }

            let sqlCommand: string = `SELECT firstname, surname, username, email, profilePhoto FROM users WHERE id = ${userId}`;

            db.query(sqlCommand, async (err: any, results: any) => {
                if (err) {
                    db.end((err: any) => {
                        if (err)
                            reject(err);
                    });

                    reject(err);
                }

                db.end((err: any) => {
                    if (err)
                        reject(err);
                });
                
                resolve(results[0]);
            });
        });
    });
}

async function isEmailExistAsync(email: string): Promise<any> {
    const db = mysql.createConnection(dbConfig);
    let command: string = `SELECT * FROM users WHERE email = "${email}"`;

    return await new Promise((resolve: any, reject: any) => {
        db.connect((err: any) => {
            if (err) {
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

module.exports = router;