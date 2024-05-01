import React, { useState, useRef } from "react"
import { TreeNode } from "./VideoCommentContainer";
import axios from '../utils/AxiosWithCredentials';
import { Link, useNavigate } from "react-router-dom";
import VideoCommentNodeCSS from "../css/videopostcomment.module.css"
import { Navigate } from "react-router-dom";
import LikeDislikeIcon from './LikeDislikeIcon';

const VideoCommentNodeComponent = (props) =>{
    console.log(props)
    const [showReplyBox, setShowReplyBox]= useState(false);
    const [showEditBox, setShowEditBox] = useState(false);
    const [collapsed, setCollapsed]= useState(false);
    const commentRef= useRef("");
    const editRef= useRef("");
    const navigate = useNavigate()
    const handleReplyButton =(e)=>{
        e.preventDefault();
        setShowEditBox(false);
        setShowReplyBox(showState=>!showState);
    }
    const handleEditButton =(e)=>{
        e.preventDefault();
        setShowReplyBox(false);
        setShowEditBox(showState=>!showState);      
    }
    const handleTheReply = async (e)=>{
        e.preventDefault();
        const response = await axios.post('http://localhost:3001/videoComments', {
            UserId:props.userIdOfCurrentUser,
            Comment: commentRef.current.value,
            VideoPostId: props.tn.data.VideoPostId,
            ReplyToVideoPostCommentId: props.tn.data.VideoPostCommentId
        });
        const newCommentNodeData= {Comment:commentRef.current.value, 
         DELETED:0, 
         ReplyToVideoPostCommentId: props.tn.data.VideoPostCommentId,
         UserId:props.userIdOfCurrentUser,
         VideoPostCommentId: response.data.insertId,
         VideoPostId: props.tn.data.VideoPostId,
         rating: 0,
         username: props.usernameOfCurrentUser,
         CommentedAt: new Date(),
         likes:0,
         dislikes:0
        };
        const newCommentNode = new TreeNode(newCommentNodeData);
        commentRef.current.value="";
        props.tn.addChild(newCommentNode);
        setShowReplyBox(showState=>!showState)
        props.setRoots(prevRoots=>[...prevRoots]);
    }

    const handleDelete = async (e) => {
        e.preventDefault();
        const response = await axios.delete("http://localhost:3001/video", {params: {
            VideoPostCommentId: props.tn.data.VideoPostCommentId
        }});
        props.tn.data.DELETED=1;
        props.tn.Comment="deleted";
        props.setRoots(prevRoots=>[...prevRoots]);
    }

    const handleLike = async (e) => {
        e.preventDefault();
        if(props.tn.data.rating===0){
            const response = await axios.post(`http://localhost:3001/videoCommentRating`, {
                VideoPostCommentId: props.tn.data.VideoPostCommentId,
                UserId: props.userIdOfCurrentUser,
                LikeStatus: true
            })
            props.tn.data.rating=1;
            props.tn.data.likes = props.tn.data.likes + 1;
            props.setRoots(prevRoots=>[...prevRoots]);
        }
        else if(props.tn.data.rating===1){
            const response= await axios.delete('http://localhost:3001/video', {params: {
                VideoPostCommentId: props.tn.data.VideoPostCommentId,
                UserId: props.userIdOfCurrentUser
            }})
            props.tn.data.rating=0;
            props.tn.data.likes = props.tn.data.likes - 1;
            props.setRoots(prevRoots=>[...prevRoots]);
        }
        else if(props.tn.data.rating===-1){
            const response= await axios.delete('http://localhost:3001/video', {params: {
                VideoPostCommentId: props.tn.data.VideoPostCommentId,
                UserId: props.userIdOfCurrentUser
            }})
            const response1= await axios.post(`http://localhost:3001/videoCommentRating`, {
                VideoPostCommentId: props.tn.data.VideoPostCommentId,
                UserId: props.userIdOfCurrentUser,
                LikeStatus: true
            })
            props.tn.data.rating=1;
            props.tn.data.likes = props.tn.data.likes + 1;
            props.tn.data.dislikes = props.tn.data.dislikes - 1;
            props.setRoots(prevRoots=>[...prevRoots]);
        }
    }
    const handleDislike = async (e) => {
        e.preventDefault();
        if(props.tn.data.rating===0){
            const response = await axios.post(`http://localhost:3001/videoCommentRating`, {
                VideoPostCommentId: props.tn.data.VideoPostCommentId,
                UserId: props.userIdOfCurrentUser,
                LikeStatus: false
            })
            props.tn.data.rating=-1;
            props.tn.data.dislikes = props.tn.data.dislikes + 1;
            props.setRoots(prevRoots=>[...prevRoots]);
        }
        else if(props.tn.data.rating===-1){
            const response= await axios.delete('http://localhost:3001/video', {params: {
                VideoPostCommentId: props.tn.data.VideoPostCommentId,
                UserId: props.userIdOfCurrentUser
            }})
            props.tn.data.rating=0;
            props.tn.data.dislikes = props.tn.data.dislikes - 1;
            props.setRoots(prevRoots=>[...prevRoots]);
        }
        else if(props.tn.data.rating===1){
            const response= await axios.delete('http://localhost:3001/video', {params: {
                VideoPostCommentId: props.tn.data.VideoPostCommentId,
                UserId: props.userIdOfCurrentUser
            }})
            const response1= await axios.post(`http://localhost:3001/videoCommentRating`, {
                VideoPostCommentId: props.tn.data.VideoPostCommentId,
                UserId: props.userIdOfCurrentUser,
                LikeStatus: false
            })
            props.tn.data.rating=-1;
            props.tn.data.likes = props.tn.data.likes - 1;
            props.tn.data.dislikes = props.tn.data.dislikes + 1;
            props.setRoots(prevRoots=>[...prevRoots]);
        }
    }


    const handleEdit = async (e, VideoPostCommentId) =>{
        e.preventDefault();
        const editComment = await axios.put(`http://localhost:3001/videoComments/${VideoPostCommentId}`, {
            updatedComment: editRef.current.value
        });
        props.tn.data.Comment= editRef.current.value;
        editRef.current.value="";
        setShowEditBox(false);
        props.setRoots(prevRoots=>[...prevRoots]);
    }
    const highlightLikeButtonRating= {
        color: props.tn.data.rating===1? "white":"black",
        backgroundColor: props.tn.data.rating===1? "black": "white",
        border: '1px solid #153e59', 
        borderRadius: '4px'
    };
    const highlightDislikeButtonRating= {
      color: props.tn.data.rating===-1? "white":"black",
      backgroundColor: props.tn.data.rating===-1? "black": "white",
      border: '1px solid #153e59', 
      borderRadius: '4px'
    };

    const collapseAndExpand = async (e)=>{
        e.preventDefault();
        setCollapsed(prev=>!prev);
    }

    return (
        <div style={{marginLeft:"20px", marginTop: "20px"}}>
            {props.tn.data.DELETED===1 && <div> <div className={VideoCommentNodeCSS['deleted-comment']}> [Deleted Comment] </div> </div>}
            {props.tn.data.DELETED===0 && <div> <a 
              style={{textDecoration: 'none'}}
              onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
              onMouseOut={(e) => e.target.style.textDecoration = 'none'}
              onClick={() => {navigate(`/username/${props.tn.data.username}`)}}
              >
              {props.tn.data.username}
              </a> ◦ {new Date(props.tn.data.CommentedAt).toLocaleString()} <br></br> {props.tn.data.Comment} </div>}
            {props.tn.data.DELETED===0 && <>
                <button className={`btn btn-primary ${props.tn.data.rating == 1 ? "liked" : ""}`} 
                    style={{padding: "4px 8px", marginTop: "10px", marginBottom: "10px"}}
                    onClick={handleLike}> 
                    <LikeDislikeIcon type="like" />
                    ({props.tn.data.likes})
                </button>
                <button className={`btn btn-primary ${props.tn.data.rating == -1 ? "disliked" : ""}`} 
                    style={{padding: "4px 8px", marginTop: "10px", marginBottom: "10px"}}
                    onClick={handleDislike}>
                    <LikeDislikeIcon type="dislike" />
                    ({props.tn.data.dislikes})
                </button></>}
            {props.tn.children.length>0 && 
                <button className="btn btn-primary" 
                    style={{padding: "4px 8px", marginTop: "10px", marginBottom: "10px"}} 
                    onClick={collapseAndExpand}>{collapsed? "+":"-"}</button>}
            {props.tn.data.UserId === props.userIdOfCurrentUser && props.tn.data.DELETED===0 && <button className="btn btn-danger" style={{padding: "4px 8px", marginTop: "10px", marginBottom: "10px"}} onClick={handleDelete}>Delete</button>}
            {props.tn.data.UserId === props.userIdOfCurrentUser && !showEditBox && !showReplyBox && props.tn.data.DELETED===0 && <button className="btn btn-primary" style={{padding: "4px 8px", marginTop: "10px", marginBottom: "10px"}} onClick={handleEditButton}>Edit</button>}
            {props.tn.data.UserId === props.userIdOfCurrentUser && showEditBox && props.tn.data.DELETED===0 && <><button className="btn btn-danger" style={{padding: "4px 8px", marginTop: "10px", marginBottom: "10px"}} onClick={handleEditButton}>Discard Edit</button>
            <form onSubmit={(e)=>{handleEdit(e, props.tn.data.VideoPostCommentId)}}>
                    <textarea ref={editRef} defaultValue= {props.tn.data.Comment} rows="5" cols="50"/>
                    <button className="btn btn-primary" style={{padding: "4px 8px", marginTop: "10px", marginBottom: "10px"}} type="submit">Submit Edit</button>
            </form>
            
            </>}
            {!showReplyBox && !showEditBox && props.tn.data.DELETED===0 && <button className="btn btn-primary" style={{padding: "4px 8px", marginTop: "10px", marginBottom: "10px"}} onClick={handleReplyButton}> Reply</button>}
            {showReplyBox && props.tn.data.DELETED===0 && <><button className="btn btn-danger" style={{padding: "4px 8px", marginTop: "10px", marginBottom: "10px"}} onClick={handleReplyButton}>Discard Comment</button>
            <form onSubmit={handleTheReply}>
                    <textarea ref={commentRef} rows="5" cols="50"/>
                    <button className="btn btn-primary" style={{padding: "4px 8px", marginTop: "10px", marginBottom: "10px"}} type="submit">Reply</button>
            </form>
            </>
            }
            {!collapsed? props.tn.children.map((childComment, index)=>(
                <VideoCommentNodeComponent
                userIdOfCurrentUser= {props.userIdOfCurrentUser}
                usernameOfCurrentUser= {props.usernameOfCurrentUser}
                setRoots={props.setRoots}
                key={index}
                tn={childComment}
                />
            )):null}
        </div>
    );
}


export default VideoCommentNodeComponent;
