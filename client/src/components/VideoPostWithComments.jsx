import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from "react-router-dom";
import { VideoCommentContainerComponent } from './VideoCommentContainer';
import { Link } from 'react-router-dom';
import { axiosRequest, hostname } from '../utils/utils';
const VideoPostWithCommentsComponent = ()=>{
    const navigate= useNavigate();
    const {VideoPostId}=useParams();
    const [username, setUsername]= React.useState(null);
    const [allTheVideoPostInformation, setAllTheVideoPostInformation]= useState(null);
    function changeTheRating(rating){
        setAllTheVideoPostInformation(prev=>({...prev, rating}))
    }
    const handleLike = async (e) => {
        e.preventDefault();
        if(allTheVideoPostInformation.rating===0){
          const axiosResponse = await axios.post(`http://localhost:3001/video-rating/${allTheVideoPostInformation.VideoPostId}`, {UserId: username.userIdOfCurrentUser, LikeStatus: true})
          changeTheRating(1);      
        }
        else if (allTheVideoPostInformation.rating===-1){
          const getLikeDislikeId= await axios.get(`http://localhost:3001/video-rating`, {params: {UserId: username.userIdOfCurrentUser, VideoPostId: allTheVideoPostInformation.VideoPostId}});
          const LikeDislikeId= getLikeDislikeId.data[0].LikeDislikeId;
          const deleteOldRating = await axios.delete('http://localhost:3001/video', {params: {LikeDislikeId}});
          const addUpdatedRating = await axios.post(`http://localhost:3001/video-rating/${allTheVideoPostInformation.VideoPostId}`, {UserId: username.userIdOfCurrentUser, LikeStatus: true})
          changeTheRating(1); 
          
        }
        else if (allTheVideoPostInformation.rating===1){
          const getLikeDislikeId= await axios.get(`http://localhost:3001/video-rating`, {params: {UserId: username.userIdOfCurrentUser, VideoPostId: allTheVideoPostInformation.VideoPostId}});
          const LikeDislikeId= getLikeDislikeId.data[0].LikeDislikeId;
          const deleteOldRating = await axios.delete('http://localhost:3001/video', {params: {LikeDislikeId}});
          changeTheRating(0)
        }
    }

    const handleDislike= async (e)=>{
        e.preventDefault();
        if(allTheVideoPostInformation.rating===0){
          const axiosResponse = await axios.post(`http://localhost:3001/video-rating/${allTheVideoPostInformation.VideoPostId}`, {UserId: username.userIdOfCurrentUser, LikeStatus: false})
          changeTheRating(-1);   
        }
        else if (allTheVideoPostInformation.rating===1){
          const getLikeDislikeId= await axios.get(`http://localhost:3001/video-rating`, {params: {UserId: username.userIdOfCurrentUser, VideoPostId: allTheVideoPostInformation.VideoPostId}});
          const LikeDislikeId= getLikeDislikeId.data[0].LikeDislikeId;
          const deleteOldRating = await axios.delete('http://localhost:3001/video', {params: {LikeDislikeId}});
          const addUpdatedRating = await axios.post(`http://localhost:3001/video-rating/${allTheVideoPostInformation.VideoPostId}`, {UserId: username.userIdOfCurrentUser, LikeStatus: false})
          changeTheRating(-1);
          
        }
        else if (allTheVideoPostInformation.rating===-1){
          const getLikeDislikeId= await axios.get(`http://localhost:3001/video-rating`, {params: {UserId: username.userIdOfCurrentUser, VideoPostId: allTheVideoPostInformation.VideoPostId}});
          const LikeDislikeId= getLikeDislikeId.data[0].LikeDislikeId;
          const deleteOldRating = await axios.delete('http://localhost:3001/video', {params: {LikeDislikeId}});
          changeTheRating(0);

        }

    }
    const handleDelete = async (e) => {
        e.preventDefault();
        try {
          const deletionResponse = await axios.delete(`http://localhost:3001/video`, {params: {VideoPostId: allTheVideoPostInformation.VideoPostId}});
          navigate("/");
        }
        catch(err){
          console.log(err);
        }
      }

    const tokenVerify= async (e) => {
        const theToken= localStorage.getItem("token");
        if(theToken){
            try{
                const response= await axios.get(`http://localhost:3001/verify-token/${theToken}`)
                if(response.data.username){
                    const userIdOfCurrentUser = (await axios.get(`${hostname}/users/id`, {params:{username:response.data.username}})).data.id;
                    setUsername({userIdOfCurrentUser, username:response.data.username})
                }
                else {
                    navigate("/");
                }
            }
    
            catch(error){
                console.log(error);
            }
        }
        else{
            navigate("/");
        }
    }

    const fetchInformation = async ()=>{
        try{
            const videoBasicInfo= await axiosRequest(3,2, "video/id", {VideoPostId});
            videoBasicInfo.data[0].username= (await axios.get("http://localhost:3001/users/id", 
            {
                params:{ UserId:videoBasicInfo.data[0].UserId }
            })).data.username;
            const rating= await axiosRequest(3,2,"video-rating", {UserId:username.userIdOfCurrentUser, VideoPostId});
            const genres= await axiosRequest(3,2,"video-by-genre-or-user", {VideoPostId});
            for(const genre of genres.data) {
                const GenreName = await axios.get(`${hostname}/genreName`, {params:{GenreId: genre.GenreId}})
                genre.GenreName= GenreName.data[0].Genre;
            }
            const theInfo= {...videoBasicInfo.data[0], rating:rating.data.length===0 ? 0:rating.data[0].LikeStatus===1 ? 1:-1, genres:genres.data};
            console.log(theInfo)
            setAllTheVideoPostInformation(theInfo);
        }
        catch(err){
            console.log(err)
            console.log("This video does not exist.")
        }
    }
    React.useEffect(()=>{
        tokenVerify();
    },[]);

    React.useEffect(()=>{
        if(username){
            fetchInformation();

        }
    }, [username])
    const highlightLikeButtonRating= {
        color: allTheVideoPostInformation!==null && allTheVideoPostInformation.rating===1? "white":"black",
        backgroundColor: allTheVideoPostInformation!==null && allTheVideoPostInformation.rating===1? "black": "white",
        border: '1px solid #153e59', 
        borderRadius: '4px'
    };
      
    const highlightDislikeButtonRating= {
      color: allTheVideoPostInformation!==null && allTheVideoPostInformation.rating===-1? "white":"black",
      backgroundColor: allTheVideoPostInformation!==null && allTheVideoPostInformation.rating===-1? "black": "white",
      border: '1px solid #153e59', 
      borderRadius: '4px'
    };

    return (
        allTheVideoPostInformation!==null && (<div>
            <h5><Link to={`/username/${allTheVideoPostInformation.username}`}>{allTheVideoPostInformation.username}</Link></h5>
            <h6>{allTheVideoPostInformation.Title}</h6>
            <div>{allTheVideoPostInformation.VideoLinkId}</div>
            <h4>Tags</h4>
            {allTheVideoPostInformation.genres.map((genre, index)=>(
              <React.Fragment key={index}>
                <div>{genre.GenreName}</div>
              </React.Fragment>
            ))}
            <button style={highlightLikeButtonRating} onClick={handleLike}>Like</button>
            <button style={highlightDislikeButtonRating} onClick={handleDislike}>Dislike</button>
            {allTheVideoPostInformation.UserId===username.userIdOfCurrentUser && <button onClick={handleDelete}>Delete</button>}
            <VideoCommentContainerComponent 
                VideoPostId= {allTheVideoPostInformation.VideoPostId}
                userIdOfCurrentUser= {username.userIdOfCurrentUser}
                usernameOfCurrentUser= {username.username}
            />
        </div>)
    )


}

export default VideoPostWithCommentsComponent;
