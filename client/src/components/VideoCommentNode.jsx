import React, { useState, useRef } from "react"
import { TreeNode } from "./VideoCommentContainer";
import axios from "axios";
import { Link } from "react-router-dom";
const VideoCommentNodeComponent = (props) =>{
    const [showReplyBox, setShowReplyBox]= useState(false);
    const [showEditBox, setShowEditBox] = useState(false);
    const [collapsed, setCollapsed]= useState(false);
    const commentRef= useRef("");
    const editRef= useRef("");
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
         username: props.usernameOfCurrentUser
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
            props.setRoots(prevRoots=>[...prevRoots]);
        }
        else if(props.tn.data.rating===1){
            const response= await axios.delete('http://localhost:3001/video', {params: {
                VideoPostCommentId: props.tn.data.VideoPostCommentId,
                UserId: props.userIdOfCurrentUser
            }})
            props.tn.data.rating=0;
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
            props.setRoots(prevRoots=>[...prevRoots]);
        }
        else if(props.tn.data.rating===-1){
            const response= await axios.delete('http://localhost:3001/video', {params: {
                VideoPostCommentId: props.tn.data.VideoPostCommentId,
                UserId: props.userIdOfCurrentUser
            }})
            props.tn.data.rating=0;
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
        <div style={{marginLeft:"50px"}}>
            {props.tn.data.DELETED===1 && <p><strong>{`Deleted Comment`}</strong></p>}
            {props.tn.data.DELETED===0 && <p><strong>{<Link to={`/username/${props.tn.data.username}`}>{`${props.tn.data.username}: `}</Link>}</strong>{props.tn.data.Comment}</p>}
            {props.tn.data.DELETED===0 && <><button onClick={handleLike} style={highlightLikeButtonRating}>Like comment</button>
            <button onClick={handleDislike} style={highlightDislikeButtonRating}>Dislike comment</button></>}
            {props.tn.children.length>0 && <button onClick={collapseAndExpand}>{collapsed? "Expand":"Collapse"}</button>}
            {props.tn.data.UserId === props.userIdOfCurrentUser && props.tn.data.DELETED===0 && <button onClick={handleDelete}>Delete</button>}
            {props.tn.data.UserId === props.userIdOfCurrentUser && !showEditBox && !showReplyBox && props.tn.data.DELETED===0 && <button onClick={handleEditButton}>Edit</button>}
            {props.tn.data.UserId === props.userIdOfCurrentUser && showEditBox && props.tn.data.DELETED===0 && <><button onClick={handleEditButton}>Discard Edit</button>
            <form onSubmit={(e)=>{handleEdit(e, props.tn.data.VideoPostCommentId)}}>
                    <textarea ref={editRef} defaultValue= {props.tn.data.Comment} rows="5" cols="50"/>
                    <button type="submit">Submit Edit</button>
            </form>
            
            </>}
            {!showReplyBox && !showEditBox && props.tn.data.DELETED===0 && <button onClick={handleReplyButton}>Reply</button>}
            {showReplyBox && props.tn.data.DELETED===0 && <><button onClick={handleReplyButton}>Discard Comment</button>
            <form onSubmit={handleTheReply}>
                    <textarea ref={commentRef} rows="5" cols="50"/>
                    <button type="submit">Reply</button>
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
