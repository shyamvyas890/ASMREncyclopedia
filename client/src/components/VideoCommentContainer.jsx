import React, { useState, useRef } from "react";
import axios from '../utils/AxiosWithCredentials';
import VideoCommentNodeComponent from "./VideoCommentNode";
import { TreeNode } from "../utils/utils";
const VideoCommentContainerComponent = (props)=>{
    const [roots, setRoots]= useState(null);
    const commentRef = useRef("");
    const fetchAllCommentsForThisPost = async () => {
        const fetchPosts = await axios.get(`http://localhost:3001/videoComments/${props.VideoPostId}`);
        let idToCommentMapping = {};
        let rootNodes = [];
        for(let i=0;i<fetchPosts.data.length;i++){
            const theUsernameOfCommenter = await axios.get(`http://localhost:3001/users/id`, {params: {
                    UserId:fetchPosts.data[i].UserId
            }})
            fetchPosts.data[i].username =theUsernameOfCommenter.data.username;
        }
        for(let i=0;i<fetchPosts.data.length;i++){
            const comment = new TreeNode(fetchPosts.data[i]);
            idToCommentMapping[comment.data.VideoPostCommentId]=comment;
        }
        for(let i=0;i<fetchPosts.data.length;i++){
            if(fetchPosts.data[i].ReplyToVideoPostCommentId!==null){
                idToCommentMapping[fetchPosts.data[i].ReplyToVideoPostCommentId].addChild(idToCommentMapping[fetchPosts.data[i].VideoPostCommentId])
            }
            else{
                rootNodes.push(idToCommentMapping[fetchPosts.data[i].VideoPostCommentId]);
            }
            const fetchRating= await axios.get(`http://localhost:3001/videoCommentRating`, {params:{
                UserId:props.userIdOfCurrentUser,
                VideoPostCommentId:fetchPosts.data[i].VideoPostCommentId
            }})
            idToCommentMapping[fetchPosts.data[i].VideoPostCommentId].data.rating= fetchRating.data.length===0? 0: fetchRating.data[0].LikeStatus===1? 1:-1;
        }
        setRoots(rootNodes);
    }



    


    const handleTheReply = async (e)=>{
        e.preventDefault();
        const theComment= commentRef.current.value;
        const commentResponse = await axios.post(`http://localhost:3001/videoComments`, {
            UserId: props.userIdOfCurrentUser,
            Comment: theComment,
            VideoPostId: props.VideoPostId,
            ReplyToVideoPostCommentId: null
        })
        commentRef.current.value="";
        setRoots((previousRoots)=>{
            let newRoots =[...previousRoots];
            newRoots.push(new TreeNode({
                VideoPostCommentId: commentResponse.data.insertId,
                UserId: props.userIdOfCurrentUser,
                Comment: theComment,
                VideoPostId: props.VideoPostId,
                ReplyToVideoPostCommentId:null,
                DELETED: 0,
                username: props.usernameOfCurrentUser
            }));
            return newRoots;
        })
    }
    
    React.useEffect(()=>{
        fetchAllCommentsForThisPost();
    },[props.userIdOfCurrentUser]);
    
    return (<div>
            <form onSubmit={handleTheReply}>
                    <textarea ref={commentRef} rows="5" cols="50" placeholder="What are your thoughts?"/>
                    <button type="submit">Reply</button>
            </form>
            {roots && roots.map((rootComment, index)=>(
                <VideoCommentNodeComponent 
                tn ={rootComment}
                key={index}
                userIdOfCurrentUser= {props.userIdOfCurrentUser}
                usernameOfCurrentUser= {props.usernameOfCurrentUser}
                setRoots={setRoots}
                />
            ))}
        

                
            </div>)
}

export  {VideoCommentContainerComponent, TreeNode};
