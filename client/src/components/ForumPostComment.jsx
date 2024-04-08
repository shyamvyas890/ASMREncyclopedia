import { useEffect, useState} from "react"
import axios from '../utils/AxiosWithCredentials';
import { useParams } from "react-router-dom"
import LikeDislikeComponent from "./LikeDislikeComponent"
import { useNavigate } from "react-router-dom"
export const ForumPostComment = (props) => {

    const {postID} = useParams() //ID of the forum post
    const {userID} = useParams()
    const [replies, setReplies] = useState([]) //replies to a given comment
    const [replyCommentID, setReplyCommentID] = useState() //ID of comment user is replying to
    const [isReplying, setIsReplying] = useState(false) //user is replying or not
    const [replyText, setReplyText] = useState() //the text the user replies with
    const [currentUsername, setCurrentUsername] = useState() //username of the current user
    const [commentLikes, setCommentLikes] = useState()
    const [commentDislikes, setCommentDislikes] = useState()
    const [userLikedComments, setUserLikedComments] = useState()
    const [userDislikedComments, setUserDislikedComments] = useState()
    const [isDeleted, setIsDeleted] = useState()
    const [isEditing, setIsEditing] = useState()
    const [commentBody, setCommentBody] = useState(props.body)
    const [editContent, setEditContent] = useState(props.body)
    const [showReplies, setShowReplies] = useState(false)

    const singleView = props.singleView
    const showReplyOption = props.replyOption
    const editDeleteOption = props.editDeleteOption

    const [hasParentComment, setHasParentComment] = useState()
    const [currentComment, setCurrentComment] = useState()
    const navigate = useNavigate()
    const commenterUsername = props.username

    //get current comment
    useEffect(() => {
        const getComment = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/getForumPostCommentByID/${props.id}`)
                console.log("RESPONSE: " + response.data[0])
                setCurrentComment(response.data[0])
                setCommentBody(response.data[0].body)
                if(response.data[0].parent_comment_id){
                    setHasParentComment(true)
                }
            } catch (error) {
                console.log(error)
            }
        }
        getComment()
    }, [])

    //runs everytime a comment is rendered. gets the replies to that comment (parent or reply)
    useEffect( () => {
        const getReplies = async () =>{
             try{
               const response = await axios.get(`http://localhost:3001/forumPostParentGetReplies/${postID}/${props.id}`)
               setReplies(response.data)
             }
             catch(error){
               console.log(error)
             }
        }
        getReplies()
        fetchAllPostsLikesAndDislikes()
    }, [props.id])

    //gets the username of the current user
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

    const handleReply = (id) =>{
        setReplyCommentID(id)
        setIsReplying(true)
    }

    //post information to the server, add new reply from the server response
    const postReply = () =>{

        console.log("FORUM POST ID NUMBER: " + postID)
        console.log("PARENT COMMENT ID NUMBER: " + replyCommentID)
        axios.post(`http://localhost:3001/forumPostCommentReply/${postID}/${replyCommentID}`, {
            username: currentUsername,
            body: replyText, 
            parent_comment_id: replyCommentID
        }).then( (res) => {
            const replyToAdd = {
                id: res.data.id,
                body: replyText, 
                username: res.data.username,
                comment_timestamp: new Date().toLocaleString()
            }
            setReplies([...replies, replyToAdd])
            setReplyText('')
            setIsReplying(false)
            setShowReplies(true)
        })    
    }

    const handleDeleteComment = async () =>{
        const confirmDelete = window.confirm("Are you sure you want to delete your comment?")
        if(confirmDelete){
            await axios.put(`http://localhost:3001/deleteForumPostComment/${props.id}`, {
                username: currentUsername
            })
            setIsDeleted(true)
        }

    }
    

    const handleEditCancel = () =>{
        setIsEditing(false)
    }

    const handleEditSubmit = async() =>{
        await axios.put(`http://localhost:3001/editForumPostComment/${props.id}`, {
        editedBody: editContent, username: currentUsername
       })
       setCommentBody(editContent)
       setIsEditing(false)
    }

    const showReplyStatus = () =>{
        setShowReplies(!showReplies)
        console.log(showReplies)
    }

    const fetchAllPostsLikesAndDislikes = async () => {
        await LikeDislikeComponent.fetchAllCommentsLikes(props.id, setCommentLikes);
        await LikeDislikeComponent.fetchAllCommentDislikes(props.id, setCommentDislikes);
        await LikeDislikeComponent.fetchUserLikedComments(userID, props.id, setUserLikedComments);
        await LikeDislikeComponent.fetchUserDislikedComments(userID, props.id, setUserDislikedComments);
    };

    const handleCommentLikeDislike = async (commentID, userID, rating) => {
        await LikeDislikeComponent.handleCommentsLikeDislike(commentID, userID, rating);
        //updates the likes/dislikes
        fetchAllPostsLikesAndDislikes();
    }

    //styling for nested look
    const replyStyle = {
        marginLeft: '20px', 
    };

    return(
        <div>
        {props.deleted || isDeleted ? <div><div> Deleted Comment </div> <div style={replyStyle}>
             {replies && replies.map && showReplies === true && replies.map( (reply) => (
               <ForumPostComment id = {reply.id} postID = {reply.forum_post_id} username = {reply.username} timestamp = {reply.comment_timestamp} body = {reply.body} userID = {props.userID} deleted={reply.deleted}/>
            ))}
            </div> </div>: 
            
        
        
        <div>
          
          <a 
          style={{textDecoration: 'none'}}
          onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
          onMouseOut={(e) => e.target.style.textDecoration = 'none'}
          onClick={() => {navigate(`/userHistory/${props.username}`)}}
          >
          {props.username}
         </a>  @ {new Date(props.timestamp).toLocaleString()}: {props.body}

         {isEditing ? (<div> <input value={editContent} onChange={ (e) => setEditContent(e.target.value)}/> <button onClick={handleEditCancel}> Cancel Edit </button> <button onClick={handleEditSubmit}> Confirm Edit </button></div>) : (<p></p>)}

            {showReplyOption && (<button onClick={() => handleReply(props.id)}> Reply to {props.username} </button>)}
            
            <button 
                className={`like ${userLikedComments ? "liked" : ""}`} 
                onClick={()=>handleCommentLikeDislike(props.id, userID, 1)}>
                {commentLikes} Likes
            </button>
            <button
                className={`dislike ${userDislikedComments ? "disliked" : ""}`}
                onClick={()=>handleCommentLikeDislike(props.id, userID, 0)}>
                {commentDislikes} Dislikes
            </button>
            {currentUsername === commenterUsername && editDeleteOption? (<div>
              <button onClick={setIsEditing}> Edit Comment </button> <button onClick={handleDeleteComment}> Delete Comment </button> </div>
            ) : <div></div>}
            
            <button onClick={showReplyStatus}> + </button>

            <div style={replyStyle}>
            
            {replies && replies.map && showReplies && replies.map( (reply) => (
                singleView ? (<ForumPostComment id = {reply.id} postID = {reply.forum_post_id} username = {reply.username} timestamp = {reply.comment_timestamp} body = {reply.body} userID = {props.userID} deleted={reply.deleted} replyOption={false} singleView={true} editDeleteOption={false}/>) :
                <ForumPostComment id = {reply.id} postID = {reply.forum_post_id} username = {reply.username} timestamp = {reply.comment_timestamp} body = {reply.body} userID = {props.userID} deleted={reply.deleted}/>
            ))}
            </div>

            {(isReplying && replyCommentID === props.id && (
                <div>
                   <input type="text" value={replyText} placeholder="Reply here" onChange={ (event) => {setReplyText(event.target.value)}} />
                   <button onClick={() => {postReply()}}> Reply </button>
                   <button onClick={() => {setIsReplying(false)}}> Cancel Reply </button>
                </div>)
            )}
        </div>}
        
        
        </div>
    )
}