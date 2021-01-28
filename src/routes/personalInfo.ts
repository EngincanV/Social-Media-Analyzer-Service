import express from "express";

const { getUserId, getUserEmail } = require("../helpers/userInfo");
const { getUserInfoByUserIdAsync, isUserPasswordCorrectAsync, changePasswordAsync, isEmailExistAsync, updateUserInfosAsync } = require("../services/PersonalInfoService");

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
        .catch((err: any) => res.json({ success: false, error: err }));
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
        .catch((err: any) => res.json({ success: false, error: err }));
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
        .catch((err: any) => res.json({ success: false, error: err }));
});

/**
 * @route POST /api/personal-info/edit
 * @group Personal Info - Personal Info
 * @param {string} password
 * @param {string} firstname
 * @param {string} surname
 * @param {string} email
 * @param {string} profilePhoto
 * @returns {object} 200 - An array of user info
 * @returns {Error}  400 - Unexpected error
 */
router.post("/edit", async (req: any, res: any) => {
    const token: string = req.headers['authorization'];
    const userId: number = getUserId(token);
    const currentEmail: string = getUserEmail(token);
    const { password, firstname, surname, email, profilePhoto } = req.body;

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

    await updateUserInfosAsync(firstname, surname, email, userId, profilePhoto)
        .then(() => res.json({ success: true, message: "Kullanıcı bilgileri başarılı bir şekilde değiştirilmiştir." }))
        .catch((err: any) => res.json({ success: false, error: err }));
});

module.exports = router;