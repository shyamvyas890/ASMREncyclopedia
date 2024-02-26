import axios from "axios"
import { useState } from "react"
import { useParams } from "react-router-dom"
import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import { FourmPostCommentSection } from "./ForumPostCommentSection"
import LikeDislikeComponent from "./LikeDislikeComponent"
import '../App.css';

export const ViewForumPostComponent = () =>{
   const location = useLocation()
   const state = location.state
   const navigate = useNavigate()

   const {postID} = useParams()
   const {userID} = useParams()
   const [postObject, setPostObject] = useState()
   const [postLikes, setPostLikes] = useState(new Map())
   const [postDislikes, setPostDislikes] = useState(new Map())
   const [userLikedPosts, setUserLikedPosts] = useState([])
   const [userDislikedPosts, setUserDislikedPosts] = useState([])
   const [currentUsername, setCurrentUsername] = useState()

   const [recommendedPosts, setRecommendedPosts] = useState([])

   useEffect( () =>{
      const fetchRecommendedPosts = async() =>{
        try{
          const response = await axios.get(`http://localhost:3001/forumPostRecommendedPost/${postID}`)
          setRecommendedPosts(response.data.recommendedPosts)
        }catch(error){
          console.log(error)
        }
      }
      fetchRecommendedPosts()
   }, [])

   useEffect( () => {
    const token = localStorage.getItem("token")
    const fetchUsername = async () => {
        try {
          const response = await axios.get(`http://localhost:3001/verify-token/${token}`);
          setCurrentUsername(response.data.username);
        } catch (error) {
          console.log(error);
        }
      };
    fetchUsername()
   }, [])

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

    const handleForumPostLikeDislike = async (postID, userID, rating) => {
        await LikeDislikeComponent.handleForumPostLikeDislike(postID, userID, rating);
        fetchAllPostsLikesAndDislikes();
    }

    console.log(recommendedPosts)
    return (
    (postObject ?
    <div>
        <h1> {postObject[0].title} by {postObject[0].username} @ {new Date(postObject[0].post_timestamp).toLocaleString()} </h1>
        <p> {postObject[0].body} </p>
        <button 
          className={`like ${userLikedPosts.includes(postObject[0].id) ? "liked" : ""}`}
          onClick={()=>handleForumPostLikeDislike(postObject[0].id, userID, 1)}>
          {postLikes.get(postObject[0].id)} Likes</button>
        <button 
          className={`dislike ${userDislikedPosts.includes(postObject[0].id) ? "disliked" : ""}`}
          onClick={()=>handleForumPostLikeDislike(postObject[0].id, userID, 0)}>
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
    
      <div>
        <h2> Recommended Posts </h2>
        {recommendedPosts.length > 0 ? <div>
           {recommendedPosts.map( (post) => (
            <div>
              <h3> {post.title} by {post.username} @ {new Date(post.post_timestamp).toLocaleString()} </h3>
              <button onClick={ () => {
                 navigate(`/forumPost/${post.id}/viewing/${userID}/user`)
                 window.location.reload()
              }}> View Post </button>
            </div>
           ))}
         </div> : <h3> No similar posts were found </h3>}
      </div>
    <
      

  
      : <p> Loading... </p>)
   )
}