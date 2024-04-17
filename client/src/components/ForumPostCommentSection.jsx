import { useEffect, useState} from "react"
import axios from '../utils/AxiosWithCredentials';
import { ForumPostComment } from "./ForumPostComment"
import { useParams } from "react-router-dom"
import {LikeDislikeComponent} from "./LikeDislikeComponent"
import "../css/forumpostcomentsection.css"
//props contains ID of forum post and current username
export const FourmPostCommentSection = (props) => {
   const {postID} = useParams()
   const {userID} = useParams()
   const [parentCommentsObject, setParentCommentsObject] = useState([])
   const [commentText, setCommentText] = useState()
   const [username, setUsername] = useState()
   const [sorted, setSorted] = useState()
   
   const [sortType, setSortType] = useState()
   //gets the username of the current user
   useEffect( () => {
    const fetchUsername = async () => {
        try {
          const response = await axios.get(`http://localhost:3001/verify-token`);
          setUsername(response.data.username);
        } catch (error) {
          console.log(error);
        }
      };
    fetchUsername()
   }, [])

   //get all comments associated with the post
   useEffect(() => {

      const getForumPostComments = async () => {
        try {
          const response = await axios.get(`http://localhost:3001/forumPostParentCommentGetByID/${postID}`);
          const promises = response.data.map(async (comment) => {
              //each promise -> fetching likes / dislikes for the comment
              const getCommentLikes = await axios.get(`http://localhost:3001/fetchAllForumPostCommentLikes`, { params: { commentID: comment.id } });
              comment.likes = getCommentLikes.data.length;
              const getCommentDislikes = await axios.get(`http://localhost:3001/fetchAllForumPostCommentDislikes`, { params: { commentID: comment.id } });
              comment.dislikes = getCommentDislikes.data.length;
              return comment;
          });
          //take the array of promises (the comment with its likes and dislikes) once all are fulfilled
          const commentsWithLikes = await Promise.all(promises);
          setParentCommentsObject(commentsWithLikes);
      } catch (error) {
          console.log(error)// Handle error
      }
      
      }
      getForumPostComments()
      }, [])
   
      //adding a "parent comment" (initial comment with no replies)
      const addParentComment = () =>{
         axios.post(`http://localhost:3001/forumPostComment/${postID}`, {
             username: username,
             body: commentText,
         }).then( (res) => {
             const commentToAdd = {
                 id: res.data.id,
                 body: commentText,
                 username: username, 
                 comment_timestamp: new Date().toLocaleString(), 
                 likes: 0, 
                 dislikes: 0
             }
             setParentCommentsObject([...parentCommentsObject, commentToAdd])
             setCommentText('')
         })
     }


     const sortForumPostComments = (e) =>{
      e.preventDefault()
      console.log(parentCommentsObject)
      console.log(parentCommentsObject[0])
      const copyOfAllPosts = [...parentCommentsObject]
      //newest to oldest
      if(sortType === '1'){
        copyOfAllPosts.sort((a, b) => {
          if(new Date(a.comment_timestamp) > new Date(b.comment_timestamp)){
            return 1;
          }
          else if(new Date(a.comment_timestamp) < new Date(b.comment_timestamp)){
            return -1;
          }
          else{
            return 0;
          }
        })
       }
       else if(sortType === '2'){
        copyOfAllPosts.sort((a, b) => {
          if(new Date(a.comment_timestamp) > new Date(b.comment_timestamp)){
            return -1;
          }
          else if(new Date(a.comment_timestamp) < new Date(b.comment_timestamp)){
            return 1;
          }
          else{
            return 0;
          }
        })
       }
       else if(sortType === '3'){
        copyOfAllPosts.sort( (a, b) =>{
          if(a.likes - a.dislikes > b.likes - b.dislikes){
            return -1;
          }
          else if(a.likes - a.dislikes < b.likes - b.dislikes){
            return 1;
          }
          else{
            return 0;
          }
        })
       }
       else if(sortType === '4'){
        copyOfAllPosts.sort( (a, b) =>{
          if(a.likes - a.dislikes > b.likes - b.dislikes){
            return 1;
          }
          else if(a.likes - a.dislikes < b.likes - b.dislikes){
            return -1;
          }
          else{
            return 0;
          }
        })
       }
       setParentCommentsObject(copyOfAllPosts)
    }


    //console.log(parentCommentsObject)
    //for each parent comment, render a ForumPostComment 
   return (

   <div className="comment-section-container">
     
       <form className="sort-form" onSubmit={sortForumPostComments}>
         <select onChange={(e) => setSortType(e.target.value)}>
           <option value="none">Sort By...</option>
           <option value="1">Oldest to Newest (Default)</option>
           <option value="2">Newest to oldest</option>
           <option value="3">Most Liked to Least Liked</option>
           <option value="4">Least Liked to Most Liked</option>
         </select>
         <button>Sort</button>
       </form>
     
   
     {parentCommentsObject && parentCommentsObject.map((parentComment) => (
       <div className="comment" key={parentComment.id}>
         <ForumPostComment
           id={parentComment.id}
           postID={parentComment.forumPostID}
           username={parentComment.username}
           timestamp={parentComment.comment_timestamp}
           body={parentComment.body}
           userID={userID}
           deleted={parentComment.deleted}
         />
       </div>
     ))}
   
     <div className="comment">
       <textarea
         type="text"
         value={commentText}
         placeholder="What do you think?"
         autoComplete="off"
         onChange={(event) => {
           setCommentText(event.target.value);
         }}
       />
       <button className='comment-button' onClick={addParentComment}> Comment </button>
     </div>
   </div>
   )
}