import { useEffect, useState} from "react"
import axios from '../utils/AxiosWithCredentials';
import { useParams } from "react-router-dom"
import LikeDislikeComponent from "./LikeDislikeComponent"
import { useNavigate } from "react-router-dom"
import ForumPostCommentCSS from "../css/forumpostcomment.module.css"
import LikeDislikeIcon from './LikeDislikeIcon';

export const ForumPostComment = (props) => {

    const {postID} = useParams() //ID of the forum post
    const {userID} = useParams()
    const [replies, setReplies] = useState([]) //replies to a given comment
    const [replyCommentID, setReplyCommentID] = useState() //ID of comment user is replying to
    const [isReplying, setIsReplying] = useState(false) //user is replying or not
    const [replyText, setReplyText] = useState('') //the text the user replies with
    const [currentUsername, setCurrentUsername] = useState() //username of the current user
    const [commentLikes, setCommentLikes] = useState()
    const [commentDislikes, setCommentDislikes] = useState()
    const [userLikedComments, setUserLikedComments] = useState()
    const [userDislikedComments, setUserDislikedComments] = useState()
    const [isDeleted, setIsDeleted] = useState()
    const [isEditing, setIsEditing] = useState()
    const [commentBody, setCommentBody] = useState(props.body)
    const [editContent, setEditContent] = useState(props.body)
    const [showReplies, setShowReplies] = useState(true)
    const [showRepliesText, setShowRepliesText] = useState('+')
    const [feedback, setFeedback] = useState(null)

    const singleView = props.singleView
    const showReplyOption = props.replyOption
    const editDeleteOption = props.editDeleteOption
    const singleViewID = parseInt(props.singleViewID, 10)

    const [hasParentComment, setHasParentComment] = useState()
    const [currentComment, setCurrentComment] = useState()
    const navigate = useNavigate()
    const commenterUsername = props.username

    //get current comment
    useEffect(() => {
        const getComment = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/getForumPostCommentByID/${props.id}`)
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
               let replies = response.data
               if(singleViewID){
                const singleCommentIndex = replies.findIndex(comment => comment.id === singleViewID);
                if(singleCommentIndex !== -1){
                    const singleComment = replies.splice(singleCommentIndex, 1)[0];
                    // Place it at the beginning of the array
                    replies.unshift(singleComment);
                    setReplies(replies)
                }
                else{
                    setReplies(response.data)
                }
               }
               else{
                setReplies(response.data)
               }
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
              const response = await axios.get(`http://localhost:3001/verify-token`, {withCredentials: true});
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

        
        if(replyText === ''){
            setFeedback("You cannot post an empty reply")
            return;
        }
        
        console.log("FORUM POST ID NUMBER: " + postID)
        console.log("PARENT COMMENT ID NUMBER: " + replyCommentID)
        axios.post(`http://localhost:3001/forumPostCommentReply/${postID}/${replyCommentID}`, {
            username: currentUsername,
            body: replyText, 
            parent_comment_id: replyCommentID
            
        },{withCredentials: true} ).then( (res) => {
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
            setFeedback(null)
        })    
    }

    const handleDeleteComment = async () =>{
        
            await axios.put(`http://localhost:3001/deleteForumPostComment/${props.id}`, {withCredentials: true})
            setIsDeleted(true)
        

    }
    
    const handleEditCancel = () =>{
        setIsEditing(false)
    }

    const handleEditSubmit = async() =>{
        await axios.put(`http://localhost:3001/editForumPostComment/${props.id}`, {
        editedBody: editContent
       }, {withCredentials: true})
       setCommentBody(editContent)
       setIsEditing(false)
       setFeedback(null)
    }

    const showReplyStatus = () =>{
        if(showReplies){
            setShowRepliesText('+')
        }
        else{
            setShowRepliesText('-')
        }
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
        <div style={{padding: "10px"}}id='forum-post-comment'>
           {props.deleted || isDeleted ? <div> <div className={ForumPostCommentCSS["deleted-comment"]}> [Deleted Comment] </div> <div style={replyStyle}>
             {replies && replies.map && showReplies === true && replies.map( (reply) => (
                
               <ForumPostComment id = {reply.id} postID = {reply.forum_post_id} username = {reply.username} timestamp = {reply.comment_timestamp} body = {reply.body} userID = {props.userID} deleted={reply.deleted}/>
            ))}
            </div> </div>: 

        <div className={ForumPostCommentCSS['forum-post-comment-show']}>
            <a 
            style={{textDecoration: 'none'}}
            onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
            onMouseOut={(e) => e.target.style.textDecoration = 'none'}
            onClick={() => {navigate(`/username/${props.username}`)}}
            >
            {props.username}
            </a>  ◦ {new Date(props.timestamp).toLocaleString()} <br></br> {singleView ? props.body : commentBody} 

         {isEditing ? (<div> <textarea value={editContent} onChange={ (e) => setEditContent(e.target.value)}/> <button className="btn btn-danger" style={{padding: "4px 8px", marginBottom: "10px"}} onClick={handleEditCancel}> Cancel Edit </button> <button className="btn btn-primary" style={{padding: "4px 8px", marginBottom: "10px"}} onClick={handleEditSubmit}> Confirm Edit </button></div>) : (<p></p>)}

            {showReplyOption !== false && (<button className="btn btn-primary" style={{padding: "4px 8px"}} onClick={() => handleReply(props.id)}> Reply to {props.username} </button>) }
            
            {replies.length > 0 && <button className="btn btn-primary" style={{padding: "4px 8px"}} onClick={showReplyStatus}> {showRepliesText} </button>}
            <button className={`btn btn-primary ${userLikedComments ? "liked" : ""}`} 
                style={{padding: "4px 8px"}}
                onClick={()=>handleCommentLikeDislike(props.id, userID, 1)}>
                <LikeDislikeIcon type="like" />
                ({commentLikes})
            </button>
            <button
                className={`btn btn-primary ${userDislikedComments ? "disliked" : ""}`} 
                style={{padding: "4px 8px"}}
                onClick={()=>handleCommentLikeDislike(props.id, userID, 0)}>
                <LikeDislikeIcon type="dislike" />
                ({commentDislikes})
            </button>

            {currentUsername === commenterUsername && !singleView? (<div>
              <button className="btn btn-primary" style={{padding: "4px 8px", marginTop: "10px", marginBottom: "10px"}} onClick={setIsEditing}> Edit </button> 
              <button className="btn btn-danger" style={{padding: "4px 8px", marginTop: "10px", marginBottom: "10px"}} onClick={handleDeleteComment}> Delete </button> </div>
            ) : <div></div>}
            
            

            <div style={replyStyle}>
            
            {replies && replies.map && showReplies && replies.map( (reply) => (
                singleView ? (<ForumPostComment id = {reply.id} postID = {reply.forum_post_id} username = {reply.username} timestamp = {reply.comment_timestamp} body = {reply.body} userID = {props.userID} deleted={reply.deleted} replyOption={false} singleView={true} editDeleteOption={false}/>) :
                <ForumPostComment id = {reply.id} postID = {reply.forum_post_id} username = {reply.username} timestamp = {reply.comment_timestamp} body = {reply.body} userID = {props.userID} deleted={reply.deleted}/>
            ))}
            </div>

            {(isReplying && replyCommentID === props.id && (
                <div>
                   <textarea type="text" style={{marginTop: "10px"}} value={replyText} placeholder="What do you think about that?" onChange={ (event) => {setReplyText(event.target.value)}} />
                   {feedback && (
                   <p style={{color: "red"}}>{feedback}</p>
                   )}

                   <button className="btn btn-primary" onClick={() => {postReply()}}> Reply </button>
                   <button  className="btn btn-danger" onClick={() => {setIsReplying(false)}}> Cancel </button>
                </div>)
            )}
        </div>}
        </div>
    )
}