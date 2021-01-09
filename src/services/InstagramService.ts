import { IgApiClient } from "instagram-private-api";
const Instagram = require("instagram-web-api");

const getUserInfo = async (username: string, password: string) => {
    const ig = new IgApiClient();
    ig.state.generateDevice(username);
    
    const auth = await ig.account.login(username, password);
    const infos = await ig.user.info(auth.pk);

    return infos;
};

const followerInfo = async (username: string, password: string) => {
    const ig = new IgApiClient();
    ig.state.generateDevice(username);
    
    const auth = await ig.account.login(username, password);
    const followers = ig.feed.accountFollowers(auth.pk);
    const items = await followers.items();

    return items;
};

const followingInfo = async (username: string, password: string) => {
    const ig = new IgApiClient();
    ig.state.generateDevice(username);
    
    const auth = await ig.account.login(username, password);
    const followings = ig.feed.accountFollowing(auth.pk);
    const items = await followings.items();

    return items;
}

//TODO: fix this method
const notToBeFollowed = async (username: string, password: string) => {
    const ig = new IgApiClient();
    ig.state.generateDevice(username);

    const auth = await ig.account.login(username, password);
    const followers = ig.feed.accountFollowers(auth.pk);
    const followersArr = await followers.items();
    
    const followings = ig.feed.accountFollowing(auth.pk);
    const followingsArr = await followings.items();
    
    let notToBeFollowedUsers: any[] = [];

    followersArr.forEach((value) => {
        if(followingsArr.find(x => x.username == value.username) === undefined) {
            notToBeFollowedUsers.push(value);
        }
    })

    return notToBeFollowedUsers;
};

interface IUserInfo {
    bio: string;
    followers_count: number;
    followings_count: number;
    full_name: string;
    userId: number;
    is_private: boolean;
    profile_pic_url: string;
    post_count: number;
    notToBeFollowed: any[];
};

const getUserInfoByUsername = async (searchUsername: string) => {
    const USERNAME = "myprojectaccount";
    const PASSWORD = "s123456789.";

    const client = new Instagram({ username: USERNAME, password: PASSWORD });
    let userInfo: IUserInfo = { bio: "", followers_count: 0, followings_count: 0, full_name: "", userId: 0, is_private: false, profile_pic_url: "", notToBeFollowed: [], post_count: 0 };
    let notToBeFollowedUsers = [];

    await client.login(USERNAME, PASSWORD); 

    await client.getUserByUsername({ username: searchUsername })
        .then(({ biography, edge_followed_by, edge_follow, full_name, id, is_private, profile_pic_url, edge_owner_to_timeline_media }: any) => {
            userInfo = {
                bio: biography,
                followers_count: edge_followed_by.count,
                followings_count: edge_follow.count,
                full_name,
                userId: id,
                is_private,
                profile_pic_url,
                post_count: edge_owner_to_timeline_media.count,
                notToBeFollowed: []
            };
        });

    const userId: string = userInfo.userId.toString();
    
    const followings = await client.getFollowings({ userId })
        .then((res: any) => res.data);

    const followers = await client.getFollowers({ userId })
        .then((res: any) => res.data);

    notToBeFollowedUsers = followings;

    for (let i = 0; i < followings.length; i++) {
        for (let j = 0; j < followers.length; j++) {
            if (followings[i].id === followers[j].id) {
                notToBeFollowedUsers.splice(i, 1);
            }
        }
    }

    userInfo.notToBeFollowed = notToBeFollowedUsers;

    return userInfo;
};

const getUserInstagramStats = async (username: string, password: string) => {
    const ig = new IgApiClient();
    ig.state.generateDevice(username);
    
    const auth = await ig.account.login(username, password);
    const infos = await ig.user.info(auth.pk);

    const followerCount = infos.follower_count;
    const followingCount = infos.following_count;
    const postCount = infos.media_count;

    const userInstagramStats: IUserInstagramStats = { followerCount, followingCount, postCount };

    return userInstagramStats;
};

interface IUserInstagramStats {
    followerCount: number,
    followingCount: number,
    postCount: number
}

module.exports = { getUserInfo, followerInfo, followingInfo, notToBeFollowed, getUserInfoByUsername, getUserInstagramStats };
