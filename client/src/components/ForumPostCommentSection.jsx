import { useEffect, useState} from "react"
import axios from "axios"
import { ForumPostComment } from "./ForumPostComment"
import { useParams } from "react-router-dom"

//props contains ID of forum post and current username
export const FourmPostCommentSection = (props) => {
   const {postID} = useParams()
   const [parentCommentsObject, setParentCommentsObject] = useState([])
   const [commentText, setCommentText] = useState()
   const [username, setUsername] = useState()

   //gets the username of the current user
   useEffect( () => {
    const token = localStorage.getItem("token")
    const fetchUsername = async () => {
        try {
          const response = await axios.get(`http://localhost:3001/verify-token/${token}`);
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
  
          try{
             const response = await axios.get(`http://localhost:3001/forumPostParentCommentGetByID/${postID}`)
             setParentCommentsObject(response.data)
          }
          catch(error){
              console.log(error)
          }
      }
      getForumPostComments()
      }, [parentCommentsObject])
   
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
                 comment_timestamp: new Date().toLocaleString()
             }
             setParentCommentsObject([...parentCommentsObject, commentToAdd])
             setCommentText('')
         })
 
     }

    //for each parent comment, render a ForumPostComment 
   return (<div>
    Comments for post {props.forumPostID}

    {parentCommentsObject && parentCommentsObject.map( (parentComment) => (
      <ForumPostComment id = {parentComment.id} postID = {props.forumPostID} username = {parentComment.username} currentUser = {props.currentUser} userID = {props.userID} timestamp = {parentComment.comment_timestamp} body = {parentComment.body}/>
    ))}

    <div>
         <input type="text" value={commentText} placeholder="Comment here" autoComplete="off" onChange={ (event) => {setCommentText(event.target.value)}} />
         <button onClick={addParentComment}> Add Comment </button>
    </div>
   </div>)
}