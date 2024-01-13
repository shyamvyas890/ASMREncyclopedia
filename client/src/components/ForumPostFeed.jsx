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

return <div>
<h1>All Posts Feed</h1>
<div className="feed-posts">

    {allPosts.map(post=>(
        <div className="user-posts" key={post.id}>
            <h2>{post.title} by {post.username} @ {new Date(post.post_timestamp).toLocaleString()} </h2>
            <p>{post.body}</p>
            <button onClick={ () => navigate(`/forumPost/${post.id}/viewing`, {state: {username: props.username}})}> View Post </button>
        </div>
    ))}
</div>
</div>
}