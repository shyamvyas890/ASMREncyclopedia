import axios from '../utils/AxiosWithCredentials';
import { useState } from "react"
import { useParams } from "react-router-dom"
import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import { FourmPostCommentSection } from "./ForumPostCommentSection"
import LikeDislikeComponent from "./LikeDislikeComponent"
import '../index.css';
import '../css/viewforumpost.css'
import NavigationComponent from './Navigation';
export const ViewForumPostComponent = () =>{
   const location = useLocation()
   const state = location.state
   const navigate = useNavigate()

   const {postID} = useParams()
   const {userID} = useParams()
   const [postObject, setPostObject] = useState()
   const [allPosts, setAllPosts] = useState([])
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
          const response = await axios.get(`http://localhost:3001/forumPostRecommendedPost/${postID}`, {withCredentials: true})
          setRecommendedPosts(response.data.recommendedPosts)
        }catch(error){
          console.log(error)
        }
      }
      fetchRecommendedPosts()
   }, [])

   useEffect( () =>{
    const fetchAllPosts = async () =>{
      try{
        const res = await axios.get("http://localhost:3001/forumPostsAll")
        setAllPosts(res.data)
      }
      catch(err){
        console.log(err)
      }
    }
    fetchAllPosts()
   }, [])


   useEffect( () => {
    const fetchUsername = async () => {
        try {
          const response = await axios.get(`http://localhost:3001/verify-token`, {withCredentials: true});
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
           const response = await axios.get(`http://localhost:3001/forumPostsById/${postID}`, {withCredentials: true})
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
         await axios.delete(`http://localhost:3001/forumPostDelete/${postID}`, {
          currentUsername, currentUsername
         }, {withCredentials: true})
         navigate("/forumPosts")
      }
    }

    const cancelEdit = () =>{
      setIsEditing(false)
      setPostBody(postBody)
    }

    const submitEdit = async () =>{

       try{
        await axios.put(`http://localhost:3001/editForumPost/${postID}`, {
          newBody: editContent, username: currentUsername, allPosts: allPosts
         }, {withCredentials: true})
         setPostBody(editContent)
         setIsEditing(false)
       }
       catch(err){
        console.log(err)
       }
    }

    console.log("Recommendations: " + recommendedPosts)

    return (
        (postObject ?
        <div>
          <NavigationComponent />
          <div className="user-posts-view">
            <h2> <a 
            style={{textDecoration: 'none'}}
            onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
            onMouseOut={(e) => e.target.style.textDecoration = 'none'}
            onClick={() => {navigate(`/username/${postObject[0].username}`)}}
            >
            {postObject[0].username}
           </a> 
           ◦ {new Date(postObject[0].post_timestamp).toLocaleString()}</h2>
           <h4 style={{fontWeight: "bold"}}> {postObject[0].title} </h4>

           <p>{isEditing ? (<div> <input value={editContent} onChange={ (e) => {setEditContent(e.target.value)}}/> <button onClick={cancelEdit} style={{border: "none"}}> Cancel Edit </button> <button style={{border: "none"}} onClick={submitEdit}> Confirm Edit </button></div>) : (<p> {editContent} </p>)}</p>

          <div>
            Tag(s) {postObject[0].tags && postObject[0].tags.split(',').map(tag => ( //If tags!=null split tags
             <div key={tag ? tag.trim() : 'null'}>
               <span>{tag ? tag.trim() : 'null'}</span>
             </div>
           ))}
          </div>

        <div style={{display: "flex"}}>
          <button onClick = {setIsEditing} style={{backgroundColor: "#4CAF50", border: "none"}}> Edit </button>
          <button onClick={handleDeletePost} style={{backgroundColor: "red", border: "none"}}> Delete </button> 
          

          <button 
            className={`like ${userLikedPosts.includes(postObject[0].id) ? "liked" : ""}`}
            onClick={()=>handleForumPostLikeDislike(postObject[0].id, userID, 1)}>
            {postLikes.get(postObject[0].id)} Likes</button>
          <button 
            className={`dislike ${userDislikedPosts.includes(postObject[0].id) ? "disliked" : ""}`}
            onClick={()=>handleForumPostLikeDislike(postObject[0].id, userID, 0)}>
            {postDislikes.get(postObject[0].id)} Dislikes</button>

            {currentUsername === postObject[0].username ? <div>
          
        </div> : <div> </div>}
        </div>
        

      </div>

      <div style={{ display: 'flex' }}>
        <FourmPostCommentSection />
        <div className="recommended-posts">
          
          {recommendedPosts.length > 0 ? <div>
            <h2 style={{color: "white"}}> You might also like... </h2>
           {recommendedPosts.map( (post) => (
            <div className="recommended-post">
              <h4> <a 
          style={{textDecoration: 'none'}}
          onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
          onMouseOut={(e) => e.target.style.textDecoration = 'none'}
          onClick={() => {navigate(`/username/${post.username}`)}}
          >
          {post.username}
         </a>  ◦ {new Date(post.post_timestamp).toLocaleString()} </h4>

             <h5 style={{fontWeight: "bold"}}> {post.title}</h5>
              <button style={{backgroundColor: "#3B9EBF", color: "#FFF", border: "none"}} onClick={ () => {
                 navigate(`/forumPost/${post.id}/viewing/${userID}/user`)
                 window.location.reload()
              }}> View Post </button>
            </div>
           ))}
         </div> : <h4> No recommendations found </h4>}
          
        </div>
      </div>       
   </div>
      : <p> Loading... </p>)
       )
}