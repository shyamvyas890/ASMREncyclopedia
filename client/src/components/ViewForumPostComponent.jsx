import axios from "axios"
import { useState } from "react"
import { useParams } from "react-router-dom"
import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import { FourmPostCommentSection } from "./ForumPostCommentSection"
import LikeDislikeComponent from "./LikeDislikeComponent"
import '../App.css';

export const ViewForumPostComponent = () =>{
   let currentUsername = ""
   const location = useLocation()
   const state = location.state
   console.log("state:: ", location.state)
   if(state && state.username){
      currentUsername = state.username
      console.log("userName: ", currentUsername)
   }
   else{
    console.log("NONE")
   }

   const {postID} = useParams()
   const {userID} = useParams()
   const [postObject, setPostObject] = useState()
   const [postLikes, setPostLikes] = useState(new Map())
   const [postDislikes, setPostDislikes] = useState(new Map())
   const [userLikedPosts, setUserLikedPosts] = useState([])
   const [userDislikedPosts, setUserDislikedPosts] = useState([])
   useEffect(() => {
    const getForumPost = async () => {
        try{
           const response = await axios.get(`http://localhost:3001/forumPostsById/${postID}`)
            setPostObject(response.data)
        }
        catch(error){
            console.log(error)
        }
    }
    getForumPost()
    }, [])

    useEffect(() => {
      if(postObject){
        fetchAllPostsLikesAndDislikes();
      }
    }, [postObject]);

    const fetchAllPostsLikesAndDislikes = async () => {
      await LikeDislikeComponent.fetchAllPostsLikes(postObject, setPostLikes);
      await LikeDislikeComponent.fetchAllPostsDislikes(postObject, setPostDislikes);
      await LikeDislikeComponent.fetchUserLikedPosts(userID,postObject, setUserLikedPosts);
      await LikeDislikeComponent.fetchUserDislikedPosts(userID, postObject, setUserDislikedPosts);
  };

    const handleLikeDislike = async (postID, userID, rating) => {
        await LikeDislikeComponent.handleLikeDislike(postID, userID, rating);
        fetchAllPostsLikesAndDislikes();
    }

   return (
    (postObject ? <div>
        <h1> {postObject[0].title} by {postObject[0].username} @ {new Date(postObject[0].post_timestamp).toLocaleString()} </h1>
        <p> {postObject[0].body} </p>
        <button 
          className={`like ${userLikedPosts.includes(postObject[0].id) ? "liked" : ""}`}
          onClick={()=>handleLikeDislike(postObject[0].id, userID, 1)}>
          {postLikes.get(postObject[0].id)} Likes</button>
        <button 
          className={`dislike ${userDislikedPosts.includes(postObject[0].id) ? "disliked" : ""}`}
          onClick={()=>handleLikeDislike(postObject[0].id, userID, 0)}>
          {postDislikes.get(postObject[0].id)} Dislikes</button>
        <div>
          Tag(s) 
          <br></br>
          {postObject[0].forums}
        </div> 
      <div>
            <FourmPostCommentSection currentUser = {currentUsername} />
            <br></br>
        </div>
        
      </div>
      : <p> Loading... </p>)
   )
}