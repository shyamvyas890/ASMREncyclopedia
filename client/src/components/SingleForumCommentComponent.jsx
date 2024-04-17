import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate, useParams } from "react-router-dom"
import { ForumPostComment } from "./ForumPostComment"
import NavigationComponent from "./Navigation"
import "../css/singleforumcomment.css"
export const SingleForumCommentComponent = () => {
    const { forumPostCommentID } = useParams()
    const [forumPostComment, setForumPostComment] = useState()
    const [currentUser, setCurrentUser] = useState()
    const [currentUserID, setCurrentUserID] = useState()
    const [hasParentComment, setHasParentComment] = useState(false)
    const [parentCommentID, setParentCommentID] = useState()
    const [enableViewParent, setEnableViewParent] = useState(false)
    const [forumPostCommentBody, setForumPostCommentBody] = useState()

    const navigate = useNavigate()
    
    const getParentComment = async () => {
        try {
            const response = await axios.get(`http://localhost:3001/getForumPostCommentByID/${parentCommentID}`, {withCredentials: true})
            console.log("RESPONSE: " + response.data[0])
            console.log("BODY: " + response.data[0].body)
            setForumPostComment(response.data[0])
            setForumPostCommentBody(response.data[0].body)
            if(response.data[0].parent_comment_id){
                console.log("COMMENT ID: " + response.data[0].parent_comment_id)
                setHasParentComment(true)
                setEnableViewParent(true)
                setParentCommentID(response.data[0].parent_comment_id)
            }
            else{
                setEnableViewParent(false)
            }
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        const getComment = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/getForumPostCommentByID/${forumPostCommentID}`, {withCredentials: true})
                console.log("RESPONSE: " + response.data[0])
                //setForumPostComment(response.data[0])
                //setForumPostCommentBody(response.data[0].body)
                if(response.data[0].parent_comment_id){
                    const response2 = await axios.get(`http://localhost:3001/getForumPostCommentByID/${response.data[0].parent_comment_id}`, {withCredentials: true})
                    setForumPostComment(response2.data[0])
                    setForumPostCommentBody(response2.data[0].body)
                    if(response2.data[0].parent_comment_id){
                        console.log("OMG")
                        setHasParentComment(true)
                        setEnableViewParent(true)
                        setParentCommentID(response2.data[0].parent_comment_id)
                    }
                }
                else{
                    setForumPostComment(response.data[0])
                    setForumPostCommentBody(response.data[0].body)
                    setEnableViewParent(false)
                }
            } catch (error) {
                console.log(error)
            }
        }
        getComment()
    }, [])

    
    
    

    //gets the username and id of the current user
    useEffect( () => {
        const fetchUsername = async () => {
            try {
              const response = await axios.get(`http://localhost:3001/verify-token`, {withCredentials: true});
              setCurrentUser(response.data.username);
              setCurrentUserID(response.data.UserId)
            } catch (error) {
              console.log(error);
            }
          };
        fetchUsername()
    }, [])



    const handleViewParentComment = () => {
        navigate(`/SingleForumComment/${parentCommentID}`)
        getParentComment()
    }

    return (
        <div id='single-forum-comment'>
            <div>
                <NavigationComponent />
            </div>

            {forumPostComment && (
                <div className='single-comment'>
                    <ForumPostComment
                        id={forumPostComment.id}
                        postID={forumPostComment.forum_post_id}
                        username={forumPostComment.username}
                        currentUser={currentUser}
                        userID={currentUserID}
                        timestamp={forumPostComment.comment_timestamp}
                        body={forumPostComment.body}
                        deleted={forumPostComment.deleted}
                        replyOption={false}
                        singleView={true}
                        singleViewID={forumPostCommentID}
                    />
                    {console.log(hasParentComment)}
                    
                    {enableViewParent && (
                        <div>
                            <button className='view-parent-button' onClick={handleViewParentComment}> View Parent Comment </button>
                        </div>
                    )}

                   <button className='view-all-comments-button'onClick={ () => navigate(`/forumPost/${forumPostComment.forum_post_id}/viewing/${currentUserID}/user`)}> View All Comments </button> 
                </div>
            )}
        </div>
    )
}