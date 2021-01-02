const Instagram = require("instagram-web-api");

const getUserInfo = async (username: string, password: string) => {
    const client = new Instagram({ username, password });

    await client.login({ username, password });

    const result = await client.getUserByUsername({ username });

    return result;
};

const followerInfo = async (username: string, password: string) => {
    const client = new Instagram({ username, password });

    const user = await client.login(username, password);
    const userId = user.userId;

    const result = await client.getFollowers({ userId });

    return result;
};

const followingInfo = async (username: string, password: string) => {
    const client = new Instagram({ username, password });

    const user = await client.login(username, password);
    const userId = user.userId;

    const result = await client.getFollowings({ userId });

    return result;
}

const notToBeFollowed = async (username: string, password: string) => {
    const client = new Instagram({ username, password });
    let notToBeFollowedUsers = [];

    const user = await client.login(username, password);
    const userId = user.userId;

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
    const followerCount = 5;//TODO: followers count will be get from ig service
    return followerCount;
};

module.exports = { getUserInfo, followerInfo, followingInfo, notToBeFollowed, getUserInfoByUsername, getUserInstagramStats };