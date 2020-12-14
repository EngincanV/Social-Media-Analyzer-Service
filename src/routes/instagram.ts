const express = require('express');
const router = express.Router();

const instagramService = require("../services/instagramService");

/**
 * @route POST /user-info
 * @group Instagram - Instagram Analysis
 * @param {string} username
 * @param {string} password
 * @returns {object} 200 - An array of user info
 * @returns {Error}  400 - Unexpected error
 */
router.post('/user-info', async function (req: any, res: any) {
  const { username, password } = req.body;

  await instagramService.getUserInfo(username, password)
    .then((data: object) => res.json(data));
});


/**
 * @route POST /followers
 * @group Instagram - Instagram Analysis
 * @param {string} username
 * @param {string} password
 * @returns {object} 200 - An array of user info
 * @returns {Error}  400 - Unexpected error
 */
router.post('/followers', async function (req: any, res: any) {
  const { username, password } = req.body;

  await instagramService.followerInfo(username, password)
    .then((data: any) => res.json(data));
});


/**
 * @route POST /followings
 * @group Instagram - Instagram Analysis
 * @param {string} username
 * @param {string} password
 * @returns {object} 200 - An array of user info
 * @returns {Error}  400 - Unexpected error
 */
router.post("/followings", async function (req: any, res: any) {
  const { username, password } = req.body;

  await instagramService.followingInfo(username, password)
    .then((data: any) => res.json(data));
});


/**
 * @route POST /not-followed-users
 * @group Instagram - Instagram Analysis
 * @param {string} username
 * @param {string} password
 * @returns {object} 200 - An array of user info
 * @returns {Error}  400 - Unexpected error
 */
router.post("/not-followed-users", async function (req: any, res: any) {
  const { username, password } = req.body;
  const userInfo: any = { };

  await instagramService.notToBeFollowed(username, password)
    .then((data: any) => userInfo.notToBeFollowed = data)
  res.send(userInfo);
});


/**
 * @route GET /userInfoByUsername:username
 * @group Instagram - Instagram Analysis
 * @param {string} username
 * @returns {object} 200 - An array of user info
 * @returns {Error}  400 - Unexpected error
 */
router.get("/userInfoByUsername/:username", async function (req: any, res: any) {
  const { username } = req.params;

  console.log(username);

  await instagramService.getUserInfoByUsername(username)
    .then((data: any) => res.json(data));
});

module.exports = router;