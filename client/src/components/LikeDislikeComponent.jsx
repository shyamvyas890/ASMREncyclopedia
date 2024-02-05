import axios from "axios";

const handleLikeDislike = async (postID, userID, rating)=>{
    try{
        console.log("gooo")
        //checks if user has already liked post
        const res = await axios.get("http://localhost:3001/forumPostLikeStatus/", {
            params: { postID: postID, userID: userID }
        });
        const data = res.data[0]
        //If data user has not liked/disliked post
        if(res.data.length === 0){
            await axios.post("http://localhost:3001/forumPostLikeDislike/", {}, {
                params: { postID: postID, userID: userID, rating: rating }
            })
        } 
        //Switches between like and dislike if already liked/disliked
        else if(data.LikeStatus !== rating){
            await axios.put("http://localhost:3001/forumChangeLikeDislike/", {}, {
                params: { LikeDislikeID: data.LikeDislikeID, rating: rating }
            })
        }
        //Unlikes/undislikes if already liked/disliked
        else if(data.LikeStatus === rating){
            await axios.delete("http://localhost:3001/forumDeleteLikeDislike/", {
                params: { LikeDislikeID: data.LikeDislikeID }
            })
        } else{
            console.log("err")
        }
    }catch(err){
        console.log(err)
    };
};

//gets likes for all posts
const fetchAllPostsLikes = async (allPosts, setAllPostLikes)=>{
    console.log("setAllPostLikes: ", setAllPostLikes)
    try{
        let likesMap = new Map();
        const postsArray = Array.isArray(allPosts) ? allPosts : [allPosts];
        for(const post of postsArray){
            const likesData = await axios.get("http://localhost:3001/fetchAllForumPostLikes", {
                params: {postID: post.id}
            });
            likesMap.set(post.id, likesData.data.length)
        }
        setAllPostLikes(likesMap);
    }catch(err){
        console.log(err)
    };
};

//gets dislikes for all posts
const fetchAllPostsDislikes = async (allPosts, setAllPostDislikes)=>{
    try{
        let dislikesMap = new Map();
        const postsArray = Array.isArray(allPosts) ? allPosts : [allPosts];
        for(const post of postsArray){
            const dislikesData = await axios.get("http://localhost:3001/fetchAllForumPostDislikes", {
                params: {postID: post.id}
            });
            dislikesMap.set(post.id, dislikesData.data.length)
        }
        setAllPostDislikes(dislikesMap)
    }catch(err){
        console.log(err)
    };
};

const fetchUserLikedPosts = async (userID, allPosts, setUserLikedPosts)=>{
    try{
        let likedPosts = []
        const postsArray = Array.isArray(allPosts) ? allPosts : [allPosts];
        for(const post of postsArray){
            const res = await axios.get("http://localhost:3001/forumPostsLikedByUser", {
                params: {postID: post.id, userID: userID}
            });
            if(res.data.length !== 0){
                likedPosts.push(post.id)
            }
        }
        setUserLikedPosts(likedPosts)
    }catch(err){
        console.log(err)
    };
};

const fetchUserDislikedPosts = async (userID, allPosts, setUserDislikedPosts)=>{
    try{
        let dislikedPosts = []
        const postsArray = Array.isArray(allPosts) ? allPosts : [allPosts];
        for(const post of postsArray){
            const res = await axios.get("http://localhost:3001/forumPostsDislikedByUser", {
                params: {postID: post.id, userID: userID}
            });
            if(res.data.length !== 0){
                dislikedPosts.push(post.id)
            }
        }
        setUserDislikedPosts(dislikedPosts)
    }catch(err){
        console.log(err)
    };
};

export default { handleLikeDislike, fetchAllPostsLikes, fetchAllPostsDislikes, fetchUserLikedPosts, fetchUserDislikedPosts}