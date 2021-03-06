const pool = require("../config/dbConnection");
const bcrypt = require("bcrypt");

import hashConfig from "../config/hashconfig";

const getUserInfoByUserIdAsync = async (userId: number) => {
    return await new Promise((resolve: any, reject: any) => {
        pool.getConnection(async (err: any, connection: any) => {
            if (err) {
                reject(err);
            }

            let sqlCommand: string = `SELECT firstname, surname, username, email, profilePhoto FROM users WHERE id = ${userId}`;

            connection.query(sqlCommand, async (err: any, results: any) => {
                if (err) {
                    connection.release();

                    reject(err);
                }

                connection.release();

                resolve(results[0]);
            });
        });
    });
}

const isUserPasswordCorrectAsync = async (password: string, userId: number): Promise<boolean> => {
    let sqlCommand: string = `SELECT * FROM users WHERE id = ${userId}`;

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

                    const hashedPassword = results[0].password;
                    const isUserPaswordCorrect: boolean = await comparePasswordAsync(password, hashedPassword);

                    resolve(isUserPaswordCorrect);
                });
            }
        });
    });
}

const changePasswordAsync = async (password: string, userId: number): Promise<any> => {
    return await new Promise((resolve: any, reject: any) => {
        pool.getConnection(async (err: any, connection: any) => {
            if (err) {
                reject(err);
            }

            let hashPassword: string = await hashPasswordAsync(password);
            let sqlCommand: string = `UPDATE users SET password = "${hashPassword}" WHERE id=${userId}`;

            connection.query(sqlCommand, async (err: any, results: any) => {
                if (err) {
                    connection.release();
                    reject(err);
                }

                connection.release();
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

const updateUserInfosAsync = async (firstname: string, surname: string, email: string, userId: number, profilePhoto: string) => {
    return await new Promise((resolve: any, reject: any) => {
        pool.getConnection(async (err: any, connection: any) => {
            if (err) {
                reject(err);
            }

            let sqlCommand: string = `UPDATE users SET firstname = "${firstname}", surname = "${surname}", email = "${email}", profilePhoto = "${profilePhoto}" WHERE id=${userId}`;

            connection.query(sqlCommand, async (err: any, results: any) => {
                if (err) {
                    connection.release();
                    reject(err);
                }

                connection.release();
                resolve(results);
            });
        });
    });
}

async function isEmailExistAsync(email: string): Promise<any> {
    let command: string = `SELECT * FROM users WHERE email = "${email}"`;

    return await new Promise((resolve: any, reject: any) => {
        pool.getConnection((err: any, connection: any) => {
            if (err) {
                reject(err);
            }

            connection.query(command, (err: any, results: any) => {
                if (err) {
                    connection.release();
                    reject(err);
                }

                var isEmailExist: boolean = results.length > 0;

                resolve(isEmailExist);
            });

        });
    });
}

module.exports = { getUserInfoByUserIdAsync, isUserPasswordCorrectAsync, changePasswordAsync, isEmailExistAsync, updateUserInfosAsync };