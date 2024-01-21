import { useEffect, useState} from "react"
import axios from "axios"
import { useParams } from "react-router-dom"

export const ForumPostComment = (props) => {

    const {postID} = useParams() //ID of the forum post
    const [replies, setReplies] = useState([]) //replies to a given comment
    const [replyCommentID, setReplyCommentID] = useState() //ID of comment user is replying to
    const [isReplying, setIsReplying] = useState(false) //user is replying or not
    const [replyText, setReplyText] = useState() //the text the user replies with
    const [currentUsername, setCurrentUsername] = useState() //username of the current user

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
            console.log("REPLY ID: " + res.data.id)
            console.log("REPLY USERNAME: " + res.data.username)
            setIsReplying(false)
        })    
    }

    //styling for nested look
    const replyStyle = {
        marginLeft: '20px', 
    };

    return(
        <div>
            {props.username} @ {new Date(props.timestamp).toLocaleString()}: {props.body}
            <button onClick={() => handleReply(props.id)}> Reply to {props.username} </button>
            <div style={replyStyle}>
            {replies && replies.map( (reply) => (
                <ForumPostComment id = {reply.id} postID = {reply.forum_post_id} username = {reply.username} timestamp = {reply.comment_timestamp} body = {reply.body}/>
            ))}
            </div> 

            
            {(isReplying && replyCommentID === props.id && (
                <div>
                   <input type="text" placeholder="Reply here" onChange={ (event) => {setReplyText(event.target.value)}} />
                   <button onClick={() => {postReply()}}> Reply </button>
                   <button onClick={ () => {setIsReplying(false)}}> Cancel Reply </button>
                </div>)
            )}
        </div>
    )
}