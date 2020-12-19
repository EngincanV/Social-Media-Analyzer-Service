import express from "express";
const mysql = require("mysql"); 
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

import dbConfig from "../config/dbconfig";
import hashConfig from "../config/hashconfig";
import jwtConfig from "../config/jwt-secret-key";

const router = express();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

/**
 * @route POST /account/login
 * @group Account - Operations about user
 * @param {string} username
 * @param {string} password
 * @returns {object} 200 - An array of user info
 * @returns {Error}  400 - Unexpected error
 */
router.post('/login', async (req, res, next) => {
    const db = mysql.createConnection(dbConfig);
    const { username, password } = req.body;

    let sql: string = `SELECT * FROM accounts WHERE Username = "${username}"`
    db.connect((err: any) => {
        if (err) {
            throw err;
        }
        else {
            db.query(sql, async (err: any, results: any) => {
                if (err) {
                    res.send({ 'success': 'false', 'message': 'Could not connect db' });
                }
                else if (results.length > 0) {
                    var hashedPassword: string = results[0].Password;

                    const isSuccess: boolean = await comparePasswordAsync(password, hashedPassword);

                    if (isSuccess) {
                        const token: string = jwt.sign({
                            exp: Math.floor(Date.now() / 1000) + (60 * 60), //1 hour
                            data: { username: results[0].Username }
                        }, jwtConfig.secretKey);

                        res.send({ 'success': 'true', token: token });
                    }

                    res.send({ success: false, message: "Given password is wrong" });
                }
                else {
                    res.send({ success: false, message: "User not found" });
                }
            });
            db.end((err: any) => {
                if (err) throw err;
            })
        }
    })
});

/**
 * @route POST /account/register
 * @group Account - Operations about user
 * @param {string} name
 * @param {string} surname
 * @param {string} username
 * @param {string} email - eg: admin@gmail.com
 * @param {string} password
 * @returns {object} 200 - An array of user info
 * @returns {Error}  400 - Unexpected error
 */
router.post('/register', async (req, res, next) => {
    const db = mysql.createConnection(dbConfig);
    const { name, surname, username, email, password } = req.body;

    var isUserExist: boolean = isUsernameExist(username);
    var hashedPassword: string = await hashPasswordAsync(password);

    let sql: string = `INSERT INTO accounts (Name, Surname, Username, Email, Password) VALUES ("${name}", "${surname}","${username}","${email}","${hashedPassword}")`;
    
    db.connect((err: any) => {
        if (err) {
            throw err;
        }
        else {
            if (isUserExist) {
                res.send({ message: "Username already exist, please choose a new username" });
            }
            db.query(sql, (err: any, results: any) => {
                if (err) {
                    res.send({ 'success': 'false', 'message': 'You must change username' });
                }
                else {
                    res.send(results);
                }
            });
            db.end((err: any) => {
                if (err) throw err;
            });
        }
    })
});

function isUsernameExist(username: string): any {
    const db = mysql.createConnection(dbConfig);
    let command: string = `SELECT * FROM accounts WHERE Username = "${username}"`;

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

module.exports = router;