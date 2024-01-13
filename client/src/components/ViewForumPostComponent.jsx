import axios from "axios"
import { useState } from "react"
import { useParams } from "react-router-dom"
import { useEffect } from "react"
import { useLocation } from "react-router-dom"
export const ViewForumPostComponent = () =>{
   let currentUsername = ""
   const location = useLocation()
   const state = location.state
   if(state && state.username){
      currentUsername = state.username
      console.log(currentUsername)
   }
   else{
    console.log("NONE")
   }

   const {id} = useParams()  
   const [postObject, setPostObject] = useState() 
   const [parentCommentsObject, setParentCommentsObject] = useState([])
   const [showReplies, setShowReplies] = useState(false);
   const [commentReplies, setCommentReplies] = useState([]);
   const [commentText, setCommentText] = useState()
   const [replyCommentId, setReplyCommentId] = useState() //comment you are replying to 
   const [showReplyCommentId, setShowReplyCommentId] = useState() //comment you see replies for
   const [isReplying, setIsReplying] = useState(false)
   const [replyText, setReplyText] = useState()
   console.log(id)
   console.log(currentUsername)


   const handleReply = (id) =>{
    console.log("REPLYING TO COMMENT " + id)
    setReplyCommentId(id)
    setIsReplying(true)
   }

   const handleReplyView = (id) =>{
    console.log("VIEWING REPLIES TO COMMENT " + id)
    setReplyCommentId(id)
   }

   useEffect(() => {

    const getForumPost = async () => {

        try{
           const response = await axios.get(`http://localhost:3001/forumPostsById/${id}`)
            setPostObject(response.data)
            
        }
        catch(error){
            console.log(error)
        }
    }
    getForumPost()
    }, [])

   
    useEffect(() => {

        const getForumPostComments = async () => {
    
            try{
               const response = await axios.get(`http://localhost:3001/forumPostParentCommentGetByID/${id}`)
                setParentCommentsObject(response.data)
            }
            catch(error){
                console.log(error)
            }
        }
        getForumPostComments()
        }, [])
    
    const getCommentReplies = async(commentID) => {
        try{
            const response = await axios.get(`http://localhost:3001/forumPostParentGetReplies/${id}/${commentID}`)
            setCommentReplies(response.data)
            setReplyCommentId(commentID)
            setShowReplies(true)
            
        }
        catch(error){
            console.log(error)
        }
    }

    const addComment = () =>{
        axios.post(`http://localhost:3001/forumPostComment/${id}`, {
            username: currentUsername,
            body: commentText,
        }).then( (res) => {
            const commentToAdd = {
                body: commentText, 
                username: currentUsername, 
                comment_timestamp: new Date().toLocaleString()
            
            }
            console.log(commentToAdd.comment_timestamp)
            setParentCommentsObject([...parentCommentsObject, commentToAdd])
        })

    }

    const addCommentReply = () =>{
        console.log(replyCommentId)
        axios.post(`http://localhost:3001/forumPostCommentReply/${id}/${replyCommentId}`, {
            username: currentUsername,
            body: replyText,
            parent_comment_id: replyCommentId,
        }).then( (res) => {
            const commentToAdd = {
                body: commentText, 
                username: currentUsername, 
                comment_timestamp: new Date().toLocaleString()
            }
        })
    }

    const renderComments = (comments) =>{
        return comments.map( (comment) => (
            
            <div>
                {comment.username} @ {new Date(comment.comment_timestamp).toLocaleString()}: {comment.body}
                <button onClick={ () => handleReply(comment.id)}> Reply to {comment.username} </button>
                <button onClick={ () => handleReplyView(comment.id)}> Show Replies </button>

                {showReplies && showReplyCommentId === comment.id &&(
                    <div>
                      what
                    </div>
                )}

                {isReplying && replyCommentId === comment.id && (
                    <div>
                    <input type="text" placeholder="Comment here" autoComplete="off" onChange={ (event) => {setReplyText(event.target.value)}} />
                    <button onClick={addCommentReply}> Reply </button>
                    
                    </div>
                )}

                
            </div>
        ))
    }

    
   return (
    (postObject ? <div>
        <h1> {postObject[0].title} by {postObject[0].username} @ {new Date(postObject[0].post_timestamp).toLocaleString()} </h1>
        <p> {postObject[0].body} </p>
 
        <div> Comments </div>
        {renderComments(parentCommentsObject)}
        <br></br>
        <div>
            <input type="text" placeholder="Comment here" autoComplete="off" onChange={ (event) => {setCommentText(event.target.value)}} />
            <button onClick={addComment}> Add Comment </button>
        </div>
      </div> 
      
      : <p> Loading... </p>)
   )

}
