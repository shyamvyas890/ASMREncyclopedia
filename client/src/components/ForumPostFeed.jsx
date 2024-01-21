import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const ForumPostFeedComponent = (props) =>{
   const [allPosts, setAllPosts] = useState([])
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

const handleLikeDislike = async (postID, rating)=>{
    try{
        //checks if user has already liked post
        const res = await axios.get("http://localhost:3001/forumPostLikeStatus/", {
            params: { postID: postID, userID: props.userID }
        });
        const data = res.data[0]
        //If data user has not liked/disliked post
        if(res.data.length === 0){
            await axios.post("http://localhost:3001/forumPostLikeDislike/", {}, {
                params: { postID: postID, userID: props.userID, rating: rating }
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
    }
}

return <div>
<h1>All Posts Feed</h1>
<div className="feed-posts">
    {allPosts.map(post=>(
        <div className="user-posts" key={post.id}>
            <h2>{post.title} by {post.username} @ {post.post_timestamp} </h2>
            <p>{post.body}</p>
            <button onClick={ () => navigate(`/forumPost/${post.id}/viewing`, {state: {username: props.username}})}> View Post </button>
            <button className="like" onClick={()=>handleLikeDislike(post.id, 1)}>Like</button>
            <button className="dislike" onClick={()=>handleLikeDislike(post.id, 0)}>Dislike</button>
        </div>
    ))}
</div>
</div>
}