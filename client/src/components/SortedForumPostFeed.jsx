import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LikeDislikeComponent from "./LikeDislikeComponent"
import '../App.css';

export const SortedForumPostFeedComponent = (props) =>{
    const [allPosts, setAllPosts] = useState([])
    //Maps contain {[postID, #of likes/dislikes]}
    const [allPostLikes, setAllPostLikes] = useState(new Map())
    const [allPostDislikes, setAllPostDislikes] = useState(new Map())
    const [userLikedPosts, setUserLikedPosts] = useState([])
    const [userDislikedPosts, setUserDislikedPosts] = useState([])
    const [sortType, setSortType] = useState()
    const navigate = useNavigate()
    
    useEffect(()=>{
    const fetchAllPosts = async ()=>{
        try{
            const res = await axios.get("http://localhost:3001/forumPostsAll")
            setAllPosts(res.data);
        }catch(err){
            console.log(err)
        }
    } 
    fetchAllPosts()
}, [])

useEffect(() => {
    fetchAllPostsLikesAndDislikes();
}, [allPosts]);

const fetchAllPostsLikesAndDislikes = async () => {
    await LikeDislikeComponent.fetchAllPostsLikes(allPosts, setAllPostLikes);
    await LikeDislikeComponent.fetchAllPostsDislikes(allPosts, setAllPostDislikes);
    await LikeDislikeComponent.fetchUserLikedPosts(props.userID, allPosts, setUserLikedPosts);
    await LikeDislikeComponent.fetchUserDislikedPosts(props.userID, allPosts, setUserDislikedPosts);
};

const handleLikeDislike = async (postID, userID, rating) => {
    await LikeDislikeComponent.handleLikeDislike(postID, userID, rating);
    //updates the likes/dislikes
    fetchAllPostsLikesAndDislikes();
}

const sortPosts = () =>{
   console.log(sortType)
}

return <div>
<h1>Sorted Forum Posts Feed</h1>
<form>
 <select onChange={(e) => setSortType(e.target.value)} onSubmit={sortPosts}>
    <option> Sort posts by... </option>
    <option value="new"> Newest to Oldest </option>
    <option value="old"> Oldest To Newest </option>
    <option value="mostLiked"> Most Liked to Least Liked </option>
    <option value="leastLiked"> Least Liked to Most Liked</option>
 </select>
 <button> Sort </button>
</form>

<div className="feed-posts">
    {allPosts.map(post=>(
        <div className="user-posts" key={post.id}>
            <h2>{post.title} by {post.username} @ {new Date(post.post_timestamp).toLocaleString()}</h2>
            <p>{post.body}</p>
            <div>
              Tag(s)
              <br></br>
              {post.forums}
            </div>
            <button onClick={ () => navigate(`/forumPost/${post.id}/viewing/${props.userID}/user`, {state: {username: props.username}})}> View Post </button>
            <button 
                className={`like ${userLikedPosts.includes(post.id) ? "liked" : ""}`} 
                onClick={()=>handleLikeDislike(post.id, props.userID, 1)}>
                {allPostLikes.get(post.id)} Likes
            </button>
            <button className={`dislike ${userDislikedPosts.includes(post.id) ? "disliked" : ""}`}
                onClick={()=>handleLikeDislike(post.id, props.userID, 0)}>
                {allPostDislikes.get(post.id)} Dislikes</button>
        </div>
    ))}
</div>
</div>
}