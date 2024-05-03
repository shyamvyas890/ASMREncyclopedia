import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate, useParams } from "react-router-dom"
import { ForumPostComment } from "./ForumPostComment"


export const ForumCommentSingleComponent = (props) =>{
    const forumPostCommentID = props.id
    const singleCommentID = props.singleCommentID

    const [currentComment, setCurrentComment] = useState()
    const [currentCommentReplies, setCurrentCommentReplies] = useState()
    const navigate = useNavigate()

    //get current comment
    useEffect(() => {
        const getComment = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/getForumPostCommentByID/${forumPostCommentID}`, {withCredentials: true})
                setCurrentComment(response.data[0])

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
               const response = await axios.get(`http://localhost:3001/forumPostParentGetReplies/${currentComment.forum_post_id}/${props.id}`)
               let replies = response.data
               
               if(singleCommentID){
                //find the "notification comment" by the singleCommentID
                const singleCommentIndex = replies.findIndex(comment => comment.id == singleCommentID);
                if (singleCommentIndex !== -1) {
                    //remove the comment from its original position
                    const singleComment = replies.splice(singleCommentIndex, 1)[0];
                    //place it at the beginning of the replies
                    replies.unshift(singleComment);
                    setCurrentCommentReplies(replies)
                }
               }
               else{
                setCurrentCommentReplies(replies)
               }
               
              //setReplies(response.data)
             }
             catch(error){
               console.log(error)
             }
        }
        getReplies()
    }, [props.id])

    return(
        <div>
            {currentComment && (
                <div>
                  <a
                        style={{ textDecoration: 'none' }}
                        onMouseOver={(e) => (e.target.style.textDecoration = 'underline')}
                        onMouseOut={(e) => (e.target.style.textDecoration = 'none')}
                        onClick={() => {
                            navigate(`/userHistory/${currentComment.username}`);
                        }}
                        >
                        {currentComment.username}
                            </a>{' '}
                        @ {new Date(currentComment.comment_timestamp).toLocaleString()}: {currentComment.body}

                    
                </div>
            )}
        </div>
    )
}