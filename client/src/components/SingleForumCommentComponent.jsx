import { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate, useParams } from "react-router-dom"
import { ForumPostComment } from "./ForumPostComment"
import NavigationComponent from "./Navigation"
import SingleForumCommentCSS from "../css/singleforumcomment.module.css"
export const SingleForumCommentComponent = () => {
    const { forumPostCommentID } = useParams()
    const [forumPostComment, setForumPostComment] = useState()
    const [currentUser, setCurrentUser] = useState()
    const [currentUserID, setCurrentUserID] = useState()
    const [hasParentComment, setHasParentComment] = useState(false)
    const [parentCommentID, setParentCommentID] = useState()
    const [enableViewParent, setEnableViewParent] = useState(false)
    const [forumPostCommentBody, setForumPostCommentBody] = useState()
    const [forumPost, setForumPost] = useState()
    const navigate = useNavigate()
    
    const getParentComment = async () => {
        try {
            const response = await axios.get(`http://localhost:3001/getForumPostCommentByID/${parentCommentID}`, {withCredentials: true})
            setForumPostComment(response.data[0])
            setForumPostCommentBody(response.data[0].body)
            if(response.data[0].parent_comment_id){
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
                const responseForumPost = await axios.get(`http://localhost:3001/forumPostsById/${response.data[0].forum_post_id}`, {withCredentials: true})
                setForumPost(responseForumPost.data[0])
                if(response.data[0].parent_comment_id){
                    const response2 = await axios.get(`http://localhost:3001/getForumPostCommentByID/${response.data[0].parent_comment_id}`, {withCredentials: true})
                    
                    setForumPostComment(response2.data[0])
                    setForumPostCommentBody(response2.data[0].body)
                    if(response2.data[0].parent_comment_id){
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

            {forumPost && (<div className={SingleForumCommentCSS["container"]}> <h2> <a 
            style={{textDecoration: 'none'}}
            onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
            onMouseOut={(e) => e.target.style.textDecoration = 'none'}
            onClick={() => {navigate(`/username/${forumPost.username}`)}}
            >
            {forumPost.username}
           </a> 
           ◦ {new Date(forumPost.post_timestamp).toLocaleString()}</h2> 
           <h4 style={{fontWeight: "bold"}}> {forumPost.title} </h4>
           <p> {forumPost.body} </p>
           <div className="tag-container">
            Tag(s) {forumPost.tags && forumPost.tags.split(',').map(tag => ( //If tags!=null split tags
               <span className="tag">{tag ? tag.trim() : 'null'}</span>
           ))}
          </div>
          <button className="btn btn-primary" onClick={() => navigate(`/forumPost/${forumPost.id}/viewing/${currentUserID}/user`)}> View Post </button>
           </div>)}
            {forumPostComment && (
                <div className={SingleForumCommentCSS['comment-container']}>
                   <div className={SingleForumCommentCSS['single-comment']}>
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
                            <button className={SingleForumCommentCSS['view-parent-button']} onClick={handleViewParentComment}> View Parent Comment </button>
                        </div>
                    )}

                   <button className={SingleForumCommentCSS['view-all-comments-button']} onClick={ () => navigate(`/forumPost/${forumPostComment.forum_post_id}/viewing/${currentUserID}/user`)}> View All Comments </button> 
                </div>
                </div>
                
            )}
        </div>
    )
}