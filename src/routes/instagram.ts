import refreshDataService from "../services/RefreshDataService";
const express = require('express');
const router = express.Router();
const { getUserId } = require("../helpers/userInfo");

const instagramService = require("../services/instagramService");

/**
 * @route POST /api/instagram/user-info
 * @group Instagram - Instagram Analysis
 * @param {string} username
 * @param {string} password
 * @returns {object} 200 - An array of user info
 * @returns {Error}  400 - Unexpected error
 */
router.post('/user-info', async function (req: any, res: any) {
  const { username, password } = req.body;
  const token: string = req.headers['authorization'];
  const userId: number = getUserId(token);

  await refreshDataService.refreshDataManagerAsync(userId, username, password)
    .catch((err: any) => { console.log("hata") })

  await instagramService.getUserInfo(username, password)
    .then((data: object) => res.json({ success: true, data }))
    .catch((err: any) => res.json({ err: err }));
});

/**
 * @route POST /api/instagram/followers
 * @group Instagram - Instagram Analysis
 * @param {string} username
 * @param {string} password
 * @returns {object} 200 - An array of user info
 * @returns {Error}  400 - Unexpected error
 */
router.post('/followers', async function (req: any, res: any) {
  const { username, password } = req.body;
  const token: string = req.headers['authorization'];
  const userId: number = getUserId(token);
  
  await refreshDataService.refreshDataManagerAsync(userId, username, password);

  await instagramService.followerInfo(username, password)
    .then((data: object) => res.json(data));
});


/**
 * @route POST /api/instagram/followings
 * @group Instagram - Instagram Analysis
 * @param {string} username
 * @param {string} password
 * @returns {object} 200 - An array of user info
 * @returns {Error}  400 - Unexpected error
 */
router.post("/followings", async function (req: any, res: any) {
  const { username, password } = req.body;
  const token: string = req.headers['authorization'];
  const userId: number = getUserId(token);
  
  await refreshDataService.refreshDataManagerAsync(userId, username, password);

  await instagramService.followingInfo(username, password)
    .then((data: object) => res.json(data));
});


/**
 * @route POST /api/instagram/not-followed-users
 * @group Instagram - Instagram Analysis
 * @param {string} username
 * @param {string} password
 * @returns {object} 200 - An array of user info
 * @returns {Error}  400 - Unexpected error
 */
router.post("/not-followed-users", async function (req: any, res: any) {
  const { username, password } = req.body;
  const token: string = req.headers['authorization'];
  const userId: number = getUserId(token);
  
  await refreshDataService.refreshDataManagerAsync(userId, username, password);

  await instagramService.notToBeFollowed(username, password)
    .then((data: any) => res.json(data))
    .catch((err: any) => res.json({ message: "Lütfen daha sonra tekrar deneyiniz." }))
});


/**
 * @route GET /api/instagram/userInfoByUsername:username
 * @group Instagram - Instagram Analysis
 * @param {string} username
 * @returns {object} 200 - An array of user info
 * @returns {Error}  400 - Unexpected error
 */
router.get("/userInfoByUsername/:username", async function (req: any, res: any) {
  const { username } = req.params;

  await instagramService.getUserInfoByUsername(username)
    .then((data: any) => res.json(data))
    .catch((err: any) => res.json({ message: "Girmiş olduğunuz kullanıcı adına sahip herhangi bir bilgi bulunamamıştır. Analizine ulaşmak istediğiniz hesabın açık hesap olduğundan ve bir kulllanıcıya karşılık geldiğinden emin olarak tekrar deneyiniz.", status: false }));
});

module.exports = router;