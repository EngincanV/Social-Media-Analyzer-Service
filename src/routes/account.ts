import express from "express";
const { login, register, addProfilePhoto } = require("../services/UserService");
const { getUserId } = require("../helpers/userInfo");

//photo storage
const multer = require("multer");
const storage = multer.diskStorage({
    destination: function (req: any, file: any, callback: any) {
        callback(null, "./uploads/");
    },
    filename: function (req: any, file: any, callback: any) {
        callback(null, file.originalname);
    }
});

const fileFilter = (req: any, file: any, callback: any) => {
    if (file.mimetype === "image/jpg" || file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
        callback(null, true);
    } else {
        callback(null, false);
    }
}
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 //5 mb
    },
    fileFilter: fileFilter
});

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

/**
 * @route POST /account/add-profile-photo
 * @group Account - Operations about user
 * @param {string} password
 * @param {string} profilePhoto
 * @returns {object} 200 - An array of user info
 * @returns {Error}  400 - Unexpected error
 */
router.post("/add-profile-photo", upload.single("profilePhoto"), async (req: any, res: any) => {
    const token: string = req.headers['authorization'];
    const userId: number = getUserId(token);
    let profilePhoto: string = req.file.path.replace("\\", "/");
    const { password } = req.body;

    const addUserProfilePhoto = await addProfilePhoto(userId, password, profilePhoto);

    res.json(addUserProfilePhoto);
});

module.exports = router;
