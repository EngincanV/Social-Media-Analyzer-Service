import express from "express";
const mysql = require("mysql");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");

//photo storage
const storage = multer.diskStorage({
    destination: function (req: any, file: any, callback: any) {
        callback(null, "./uploads/");
    },
    filename: function (req: any, file: any, callback: any) {
        callback(null, file.originalname);
    }
});

const fileFilter = (req: any, file: any, callback: any) => {
    if(file.mimetype === "image/jpg" || file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
        callback(null, true);
    } else {
        callback(null, false);
    }
}

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 //5mb
    },
    fileFilter: fileFilter
});

const { getUserId } = require("../helpers/userInfo");
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

    let sql: string = `SELECT * FROM users WHERE username = "${username}"`;

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
                    var hashedPassword: string = results[0].password;

                    const isSuccess: boolean = await comparePasswordAsync(password, hashedPassword);

                    if (isSuccess) {
                        const token: string = jwt.sign({
                            exp: Math.floor(Date.now() / 1000) + (60 * 60), //1 hour
                            data: { id: results[0].id, username: results[0].username }
                        }, jwtConfig.secretKey);

                        res.send({ 'success': 'true', token });
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
 * @param {string} firstname
 * @param {string} surname
 * @param {string} username
 * @param {string} email - eg: admin@gmail.com
 * @param {string} password
 * @returns {object} 200 - An array of user info
 * @returns {Error}  400 - Unexpected error
 */
router.post('/register', async (req, res, next) => {
    const db = mysql.createConnection(dbConfig);
    const { firstname, surname, username, email, password } = req.body;

    var isUserExist: boolean = isUsernameExist(username);
    var hashedPassword: string = await hashPasswordAsync(password);

    let sql: string = `INSERT INTO users (firstname, surname, username, email, password) VALUES ("${firstname}", "${surname}","${username}","${email}","${hashedPassword}")`;

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

/**
 * @route POST /account/add-profile-photo
 * @group Account - Operations about user
 * @param {string} profilePhoto
 * @returns {object} 200 - An array of user info
 * @returns {Error}  400 - Unexpected error
 */
router.post("/add-profile-photo", upload.single("profilePhoto"), (req: any, res: any) => {
    const db = mysql.createConnection(dbConfig);
    const token: string = req.headers['authorization'];
    const userId: number = getUserId(token);
    let profilePhoto: string = req.file.path.replace("\\", "/");
    
    if (userId === 0) {
        res.end({ status: false, message: "User could not found" });
    }

    let sqlCommand: string = `UPDATE users SET profilePhoto = "${profilePhoto}" WHERE id = ${userId}`;

    db.connect((err: any) => {
        if (err) {
            throw err;
        }
        else {
            db.query(sqlCommand, (err: any, results: any) => {
                if (err) {
                    res.send({ 'success': false, message: "Something went wrong when tried to add profile photo" });
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
