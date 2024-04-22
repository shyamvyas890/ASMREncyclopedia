import React from "react";
import axios from '../utils/AxiosWithCredentials';
import { useNavigate, useParams } from "react-router-dom";
import {hostname, axiosRequest, TreeNode } from "../utils/utils";
import VideoCommentNodeComponent from "./VideoCommentNode";
import VideoPostWithCommentsComponent from "./VideoPostWithComments";
const SingleVideoCommentComponent = () =>{
    const StringVideoPostCommentId = useParams().VideoPostCommentId;
    const theVideoPostCommentId: any = parseInt(StringVideoPostCommentId===undefined? "":StringVideoPostCommentId);
    const [roots, setRoots] = React.useState<any>(null);
    const [parentId, setParentId] = React.useState<any>("");
    const [username, setUsername]= React.useState<{userIdOfCurrentUser: number, username: string;} | null>(null);
    const navigate = useNavigate();
    const tokenVerify= async () => {
            try{
                const response= await axios.get(`http://localhost:3001/verify-token`)
                const userIdOfCurrentUser = (await axios.get(`${hostname}/users/id`, {params:{username:response.data.username}})).data.id;
                setUsername({userIdOfCurrentUser, username:response.data.username})
            }
            catch(error){
                console.log(error);
                navigate("/")
            }
    }

    const fetchAllCommentsForThisPost = async () => {
        const fetchParent = (await axios.get(`${hostname}/video-comment-parent/${theVideoPostCommentId}`)).data[0].ReplyToVideoPostCommentId;
        const theRoot = await axios.get(`${hostname}/video-comment-descendants/${fetchParent===null? theVideoPostCommentId: fetchParent}`);
        console.log(theRoot);
        const fetchPosts = theRoot;
        let idToCommentMapping = {};
        let rootNodes: any = [];
        for(let i=0;i<fetchPosts.data.length;i++){
            const theUsernameOfCommenter = await axios.get(`http://localhost:3001/users/id`, {params: {
                    UserId:fetchPosts.data[i].UserId
            }})
            fetchPosts.data[i].username =theUsernameOfCommenter.data.username;
        }
        for(let i=0;i<fetchPosts.data.length;i++){
            const comment = new TreeNode(fetchPosts.data[i]);
            console.log(comment.data.VideoPostCommentId);
            idToCommentMapping[comment.data.VideoPostCommentId]=comment;
            console.log(idToCommentMapping[comment.data.VideoPostCommentId])
        }
        for(let i=0;i<fetchPosts.data.length;i++){
            if(fetchPosts.data[i].ReplyToVideoPostCommentId!==null){
                if(idToCommentMapping[fetchPosts.data[i].ReplyToVideoPostCommentId]){
                    idToCommentMapping[fetchPosts.data[i].ReplyToVideoPostCommentId].addChild(idToCommentMapping[fetchPosts.data[i].VideoPostCommentId])
                }
            }
            console.log(fetchPosts.data[i])
            console.log(fetchParent===null);
            console.log(fetchPosts.data[i].VideoPostCommentId === theVideoPostCommentId);
            if((fetchParent===null && fetchPosts.data[i].VideoPostCommentId === theVideoPostCommentId) || (fetchParent!==null && fetchPosts.data[i].VideoPostCommentId === fetchParent)) {
                rootNodes.push(idToCommentMapping[fetchPosts.data[i].VideoPostCommentId]);
            }
            const fetchRating= await axios.get(`http://localhost:3001/videoCommentRatings`, {params:{
                UserId:username===null? null:username.userIdOfCurrentUser,
                VideoPostCommentId:fetchPosts.data[i].VideoPostCommentId
            }})
            idToCommentMapping[fetchPosts.data[i].VideoPostCommentId].data.rating= fetchRating.data.length===0? 0: fetchRating.data[0].LikeStatus===1? 1:-1;
        }
        if(fetchParent!==null){
            const tn = rootNodes[0];
            const newChildren = [...tn.children];
            let theIndex=-1;
            for(let j=0;j<newChildren.length;j++){
                if(newChildren[j].data.VideoPostCommentId === theVideoPostCommentId){
                    theIndex=j;
                }
            }
            newChildren.unshift(newChildren.splice(theIndex,1)[0]);
            tn.setChildren = newChildren;
        }
        setParentId(fetchParent);
        setRoots(rootNodes);
    }
    
    React.useEffect(()=>{
        tokenVerify();
    },[])
    React.useEffect(()=>{
        if(username){
            fetchAllCommentsForThisPost();
        }
    },[username, theVideoPostCommentId]);
    return (
        
        <div>
            {roots && parentId!=="" && <VideoPostWithCommentsComponent VideoPostId={roots[0].data.VideoPostId}/>}
            {roots && parentId!=="" && <button disabled= {parentId===null} onClick={()=>{navigate(`/SingleVideoComment/${parentId}`)}}>View Parent Comment</button>}
            {roots && parentId!=="" && <button onClick={()=>{navigate(`/video/${roots[0].data.VideoPostId}`)}}>View All Comments</button>}
            {roots && parentId!=="" &&
            roots.map((rootComment, index)=>(
                <VideoCommentNodeComponent 
                tn ={rootComment}
                key={index}
                userIdOfCurrentUser= {username ===null? null:username.userIdOfCurrentUser}
                usernameOfCurrentUser= {username===null? null: username.username}
                setRoots={setRoots}
                />
            ))
            
            
            }
        </div>



    )
}

export default SingleVideoCommentComponent;