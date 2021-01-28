import express from "express";
const { login, register, addProfilePhoto } = require("../services/UserService");

const router = express();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

/**
 * @route POST /account/login
 * @group Account - Operations about user
 * @param {string} email
 * @param {string} password
 * @returns {object} 200 - An array of user info
 * @returns {Error}  400 - Unexpected error
 */
router.post('/login', async (req, res, next) => {
    const { email, password } = req.body;

    const user = await login(email, password);

    res.json(user);
});

/**
 * @route POST /account/register
 * @group Account - Operations about user
 * @param {string} firstname
 * @param {string} surname
 * @param {string} email - eg: admin@gmail.com
 * @param {string} password
 * @returns {object} 200 - An array of user info
 * @returns {Error}  400 - Unexpected error
 */
router.post('/register', async (req, res, next) => {
    const { firstname, surname, email, password } = req.body;

    const registerUser = await register(firstname, surname, email, password);

    res.json(registerUser);
});

module.exports = router;
