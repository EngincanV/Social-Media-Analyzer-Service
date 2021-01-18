import { IgApiClient } from "instagram-private-api";
const Instagram = require("instagram-web-api");

//DONE !
const getUserInfo = async (username: string, password: string) => {
    const ig = new IgApiClient();
    ig.state.generateDevice(username);

    const auth = await ig.account.login(username, password);
    console.log(auth)
    const infos = await ig.user.info(auth.pk);

    // return infos;

    var resultObj = { userInfo: infos, totalLikeCount: 0, totalCommentCount: 0 };
    const client = new Instagram({ username, password });
    await client.login({ username, password });

    const result = await client.getUserByUsername({ username });
    console.log(result)
    var posts: any[] = result.edge_owner_to_timeline_media.edges;

    posts.forEach(post => {
        resultObj.totalLikeCount += post.node.edge_liked_by.count;
        resultObj.totalCommentCount += post.node.edge_media_to_comment.count;
    });

    return resultObj;
};

//DONE !
const followerInfo = async (username: string, password: string) => {
    const ig = new IgApiClient();
    ig.state.generateDevice(username);
    let iterate: number = 0;
    
    const auth = await ig.account.login(username, password);
    const infos = await ig.user.info(auth.pk);
    const followerCount = infos.follower_count;
    const followers = ig.feed.accountFollowers(auth.pk);
    let items: any = [];

    while(iterate <= followerCount) {
        let followerItems = await followers.items();
        items.push(followerItems);
        iterate += followerItems.length;
    }

    return items;
};

//DONE !
const followingInfo = async (username: string, password: string) => {
    const ig = new IgApiClient();
    ig.state.generateDevice(username);
    let iterate: number = 0;
    
    const auth = await ig.account.login(username, password);
    const infos = await ig.user.info(auth.pk);
    const followingCount = infos.following_count;
    const followings = ig.feed.accountFollowing(auth.pk);
    const items: any = [];

    while(iterate <= followingCount) {
        let followingItems = await followings.items();
        items.push(followingItems);
        iterate += followingItems.length;
    }

    return items;
}

//DONE !
const notToBeFollowed = async (username: string, password: string) => {
    // const ig = new IgApiClient();
    // ig.state.generateDevice(username);
    
    // const followers: any[] = await followerInfo(username, password);
    // const followings: any[] = await followingInfo(username, password);
    // console.log("followers count: " + followers.length);
    // console.log("followings count: " + followings.length);
    // const notToBeFollowed: any = [];

    // followings.forEach(following => {
    //     if(followers.find(x => x.username == following.username) === undefined) {
    //         notToBeFollowed.push(following);
    //     }
    // });

    // return notToBeFollowed;
    var ig = new Instagram({username, password });
    var user = await ig.login({ username, password });
    const userId = user.userId;

    const result = await ig.getFollowers({ userId });
    var followers: any[] = result.data;
    let notToBeFollowedUsers: any[] = [];

    followers.forEach(follower => {
        if(!follower.followed_by_viewer) {
            notToBeFollowedUsers.push(follower);
        }
    });

    return notToBeFollowedUsers;
};

//DONE !
const getUserInfoByUsername = async (searchUsername: string) => {
     const ig = new IgApiClient();
    ig.state.generateDevice(searchUsername);

    const auth = await ig.account.login("productstockmanagement", "qwertY12@34");
    const userId = await ig.user.getIdByUsername(searchUsername); 
    const infos = await ig.user.info(userId);

    const { username, full_name, is_verified, media_count, follower_count, following_count, biography, total_igtv_videos,category, hd_profile_pic_versions } = infos;
    const userInfo = { username, full_name, is_verified, postCount: media_count, follower_count, following_count, biography, total_igtv_videos, category, photo: hd_profile_pic_versions[0].url };
    return userInfo;
};

//DONE !
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
