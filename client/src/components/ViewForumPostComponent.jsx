import axios from "axios"
import { useState } from "react"
import { useParams } from "react-router-dom"
import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import { FourmPostCommentSection } from "./ForumPostCommentSection"
import LikeDislikeComponent from "./LikeDislikeComponent"
import '../index.css';

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
   const [isEditing, setIsEditing] = useState()
   const [recommendedPosts, setRecommendedPosts] = useState([])
   const [editContent, setEditContent] = useState()
   const [postBody, setPostBody] = useState()

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
            setEditContent(response.data[0].body)
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

    const handleDeletePost = async () =>{
      const confirmDelete = window.confirm("Are you sure you want to delete this post?")
      if(confirmDelete){
         await axios.delete(`http://localhost:3001/forumPostDelete/${postID}`)
         navigate("/")
      }
    }

    const cancelEdit = () =>{
      setIsEditing(false)
      setPostBody(postBody)
    }

    const submitEdit = async () =>{
       await axios.put(`http://localhost:3001/editForumPost/${postID}`, {
        newBody: editContent
       })
       setPostBody(editContent)
       setIsEditing(false)
    }

    console.log(recommendedPosts)
    return (
    (postObject ?
    <div>
    <div>
        <h1> {postObject[0].title} by <a 
          style={{textDecoration: 'none'}}
          onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
          onMouseOut={(e) => e.target.style.textDecoration = 'none'}
          onClick={() => {navigate(`/userHistory/${postObject[0].username}`)}}
          >
          {postObject[0].username}
         </a>

        @ {new Date(postObject[0].post_timestamp).toLocaleString()} </h1>
        {isEditing ? (<div> <input value={editContent} onChange={ (e) => {setEditContent(e.target.value)}}/> <button onClick={cancelEdit}> Cancel Edit </button> <button onClick={submitEdit}> Confirm Edit </button></div>) : (<p> {editContent} </p>)}
        <button 
          className={`like ${userLikedPosts.includes(postObject[0].id) ? "liked" : ""}`}
          onClick={()=>handleForumPostLikeDislike(postObject[0].id, userID, 1)}>
          {postLikes.get(postObject[0].id)} Likes</button>
        <button 
          className={`dislike ${userDislikedPosts.includes(postObject[0].id) ? "disliked" : ""}`}
          onClick={()=>handleForumPostLikeDislike(postObject[0].id, userID, 0)}>
          {postDislikes.get(postObject[0].id)} Dislikes</button>
          {currentUsername === postObject[0].username ? <div>
          <button onClick={handleDeletePost}> Delete Post </button> <button onClick = {setIsEditing}> Edit Post </button>
          </div>
          : <div> </div>}
        <div>
        <div>
            Tags: {postObject[0].tags && postObject[0].tags.split(',').map(tag => ( //If tags!=null split tags
              <div>
              <span key={tag ? tag.trim() : 'null'}>{tag ? tag.trim() : 'null'}</span>
              </div>
            ))}
            </div>
        </div> 
      <div>
            <FourmPostCommentSection currentUser = {currentUsername} userID = {userID}/>
            <br></br>
        </div>
        
      </div>
    
      <div>
        <h2> Recommended Posts </h2>
        {recommendedPosts.length > 0 ? <div>
           {recommendedPosts.map( (post) => (
            <div>
              <h3> {post.title} by <a 
          style={{textDecoration: 'none'}}
          onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
          onMouseOut={(e) => e.target.style.textDecoration = 'none'}
          onClick={() => {navigate(`/userProfile/${post.username}`)}}
          >
          {post.username}
         </a>  @ {new Date(post.post_timestamp).toLocaleString()} </h3>
              <button onClick={ () => {
                 navigate(`/forumPost/${post.id}/viewing/${userID}/user`)
                 window.location.reload()
              }}> View Post </button>
            </div>
           ))}
         </div> : <h3> No similar posts were found </h3>}
      </div>
     </div>
      : <p> Loading... </p>)
   )
}