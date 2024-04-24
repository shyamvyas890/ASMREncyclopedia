import React, { useState, useRef } from "react";
import axios from '../utils/AxiosWithCredentials';
import VideoCommentNodeComponent from "./VideoCommentNode";
import { TreeNode, axiosRequest } from "../utils/utils";
import VideoCommentContainerCSS from "../css/videocommentcontainer.module.css"

const VideoCommentContainerComponent = (props)=>{
    console.log("USER ID HERE: " + props.userIdOfCurrentUser)
    console.log("USERNAME CONTAINER: " + props.usernameOfCurrentUser)
    const [roots, setRoots]= useState(null);
    const [sortedRoots, setSortedRoots] = useState(null);
    const [sortOption, setSortOption] = useState("latest");
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
            const fetchRating= await axios.get(`http://localhost:3001/videoCommentRatings`, {params:{
                UserId:props.userIdOfCurrentUser,
                VideoPostCommentId:fetchPosts.data[i].VideoPostCommentId
            }})
            idToCommentMapping[fetchPosts.data[i].VideoPostCommentId].data.rating= fetchRating.data.length===0? 0: fetchRating.data[0].LikeStatus===1? 1:-1;
        }
        for( const rootNode of rootNodes){
            const ratingsForRootNode = await axiosRequest(3,2,"videoCommentRatings", {VideoPostCommentId:rootNode.data.VideoPostCommentId, UserId: props.userIdOfCurrentUser});
            let likes=0;
            let dislikes= 0;
            for(const rating of ratingsForRootNode.data){
                if(rating.LikeStatus===1){
                    likes++;
                }
                else if (rating.LikeStatus===0){
                    dislikes++;
                }
            }
            rootNode._data= {...rootNode._data, likes, dislikes}
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
                CommentedAt: new Date().toISOString(),
                NotificationRead:0,
                rating:0,
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

    React.useEffect(()=>{
        if(roots){
            let newRootNodes = [...roots]
            if(sortOption === "latest"){
                newRootNodes.sort((a,b)=>{
                    const dateA= new Date(a._data.CommentedAt);
                    const dateB = new Date(b._data.CommentedAt);
                    if(dateA.getTime()>dateB.getTime()){
                        return -1;
                    }
                    else if(dateA.getTime()<dateB.getTime()){
                        return 1;
                    }
                    return 0;
                })
            }
            else if(sortOption === "oldest"){
                newRootNodes.sort((a,b)=>{
                    const dateA= new Date(a._data.CommentedAt);
                    const dateB = new Date(b._data.CommentedAt);
                    if(dateA.getTime()>dateB.getTime()){
                        return 1;
                    }
                    else if(dateA.getTime()<dateB.getTime()){
                        return -1;
                    }
                    return 0;
                })
                
            }
            else if(sortOption === "best"){

                newRootNodes.sort((a,b)=>{
                    const AScore = a._data.likes-a._data.dislikes;
                    const BScore = b._data.likes-b._data.dislikes;
                    if(AScore>BScore){
                        return -1;
                    }
                    else if (BScore>AScore){
                        return 1;
                    }
                    return 0;
                })
                
            }
            else if(sortOption === "worst"){
                newRootNodes.sort((a,b)=>{
                    const AScore = a._data.likes-a._data.dislikes;
                    const BScore = b._data.likes-b._data.dislikes;
                    if(AScore>BScore){
                        return 1;
                    }
                    else if (BScore>AScore){
                        return -1;
                    }
                    return 0;
                })
            }
            setSortedRoots(newRootNodes)
        }
    }, [roots, sortOption])

    
    return (<div>
        <div>
                <select className={VideoCommentContainerCSS['sort-form']} onChange={(e)=>{
                    if(e.target.value==="latest"){
                        setSortOption("latest")
                    }
                    else if(e.target.value==="oldest"){
                        setSortOption("oldest")
                    }
                    else if(e.target.value==="best"){
                        setSortOption("best")
                    }
                    else if(e.target.value==="worst"){
                        setSortOption("worst")
                    }
                }}>
                    <option value="none"> Sort by....</option>
                    <option value="latest"> Newest to Oldest (default) </option>
                    <option value="oldest"> Oldest to Newest </option>
                    <option value="best"> Most Liked to Least Liked</option>
                    <option value="worst"> Least Liked to Most Liked </option>
                </select>
            </div>
            
            {sortedRoots && sortedRoots.map((rootComment, index)=>(
                <VideoCommentNodeComponent 
                tn ={rootComment}
                key={index}
                userIdOfCurrentUser= {props.userIdOfCurrentUser}
                usernameOfCurrentUser= {props.usernameOfCurrentUser}
                setRoots={setRoots}
                />
            ))}

            <form  onSubmit={handleTheReply}>
                <textarea className={VideoCommentContainerCSS['comment']} ref={commentRef} placeholder="What do you think?"/>
                <button className="btn btn-primary" style={{padding: "4px 8px", marginBottom: "10px"}} type="submit"> Comment </button>
            </form>
        </div>)
}

export  {VideoCommentContainerComponent, TreeNode};
