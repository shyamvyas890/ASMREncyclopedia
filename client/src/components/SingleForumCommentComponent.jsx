import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate, useParams } from "react-router-dom"
import { ForumPostComment } from "./ForumPostComment"

export const SingleForumCommentComponent = () => {
    const { forumPostCommentID } = useParams()
    const [forumPostComment, setForumPostComment] = useState()
    const [currentUser, setCurrentUser] = useState()
    const [currentUserID, setCurrentUserID] = useState()
    const [hasParentComment, setHasParentComment] = useState(false)
    const [parentCommentID, setParentCommentID] = useState()
    const [forumPostCommentBody, setForumPostCommentBody] = useState()

    const navigate = useNavigate()
    
    useEffect(() => {
        const getComment = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/getForumPostCommentByID/${forumPostCommentID}`)
                console.log("RESPONSE: " + response.data[0])
                setForumPostComment(response.data[0])
                setForumPostCommentBody(response.data[0].body)
                if(response.data[0].parent_comment_id){
                    console.log("COMMENT ID: " + response.data[0].parent_comment_id)
                    setHasParentComment(true)
                    setParentCommentID(response.data[0].parent_comment_id)
                }
            } catch (error) {
                console.log(error)
            }
        }
        getComment()
    }, [])

    
    const getParentComment = async () => {
        try {
            const response = await axios.get(`http://localhost:3001/getForumPostCommentByID/${parentCommentID}`)
            console.log("RESPONSE: " + response.data[0])
            console.log("BODY: " + response.data[0].body)
            setForumPostComment(response.data[0])
            setForumPostCommentBody(response.data[0].body)
            if(response.data[0].parent_comment_id){
                console.log("COMMENT ID: " + response.data[0].parent_comment_id)
                setHasParentComment(true)
                setParentCommentID(response.data[0].parent_comment_id)
            }
        } catch (error) {
            console.log(error)
        }
    }
    

    //gets the username of the current user
    useEffect(() => {
        const token = localStorage.getItem("token")
        const fetchUsername = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/verify-token/${token}`);
                setCurrentUser(response.data.username);
            } catch (error) {
                console.log(error);
            }
        };
        fetchUsername()
    }, [])

    //gets the ID of the current user
    useEffect(() => {
        const fetchID = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/users/id?username=${currentUser}`);
                setCurrentUserID(response.data.id)
            } catch (error) {
                console.log(error);
            }
        };
        if (currentUser) {
            fetchID()
        }
    }, [currentUser])

    const handleViewParentComment = () => {
        navigate(`/singleForumComment/${parentCommentID}`)
        getParentComment()
    }

    return (
        <div>
            {forumPostComment && (
                <div>
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
                    />
                    {console.log(hasParentComment)}
                    {hasParentComment && (
                        <div>
                            <button onClick={handleViewParentComment}> View Parent Comment </button>
                        </div>
                    )}

                    <div> <button onClick={ () => navigate(`/forumPost/${forumPostComment.forum_post_id}/viewing/${currentUserID}/user`)}> View All Comments </button> </div>
                </div>
            )}
        </div>
    )
}



