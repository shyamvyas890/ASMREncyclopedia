import React from 'react';
import axios from 'axios';
const PostComponent = (props) =>{
    const handleLike = async (e) => {
        e.preventDefault();
        if(props.rating===0){
          const axiosResponse = await axios.post(`http://localhost:3001/video-rating/${props.VideoPostId}`, {UserId: props.userIdOfCurrentUser, LikeStatus: true})
          props.setUserRatings(function(prev){
            let newUserRatings= [];
            for(let i=0; i<prev.length;i++) {
              if(i===props.index){
                newUserRatings.push(1);
              }
              else {
                newUserRatings.push(prev[i]);
              }
            }
            return newUserRatings;
          })      
        }
        else if (props.rating===-1){
          const getLikeDislikeId= await axios.get(`http://localhost:3001/video-rating`, {params: {UserId: props.userIdOfCurrentUser, VideoPostId: props.VideoPostId}});
          const LikeDislikeId= getLikeDislikeId.data[0].LikeDislikeId;
          const deleteOldRating = await axios.delete('http://localhost:3001/video', {params: {LikeDislikeId}});
          const addUpdatedRating = await axios.post(`http://localhost:3001/video-rating/${props.VideoPostId}`, {UserId: props.userIdOfCurrentUser, LikeStatus: true})
          props.setUserRatings(function(prev){
            let newUserRatings= [];
            for(let i=0; i<prev.length;i++) {
              if(i===props.index){
                newUserRatings.push(1);
              }
              else {
                newUserRatings.push(prev[i]);
              }
            }
            return newUserRatings;
          }) 
          
        }
        else if (props.rating===1){
          const getLikeDislikeId= await axios.get(`http://localhost:3001/video-rating`, {params: {UserId: props.userIdOfCurrentUser, VideoPostId: props.VideoPostId}});
          const LikeDislikeId= getLikeDislikeId.data[0].LikeDislikeId;
          const deleteOldRating = await axios.delete('http://localhost:3001/video', {params: {LikeDislikeId}});
          props.setUserRatings(function(prev){
            let newUserRatings= [];
            for(let i=0; i<prev.length;i++) {
              if(i===props.index){
                newUserRatings.push(0);
              }
              else {
                newUserRatings.push(prev[i]);
              }
            }
            return newUserRatings;
          }) 

        }
    }

    const handleDislike= async (e)=>{
        e.preventDefault();
        if(props.rating===0){
          const axiosResponse = await axios.post(`http://localhost:3001/video-rating/${props.VideoPostId}`, {UserId: props.userIdOfCurrentUser, LikeStatus: false})
          props.setUserRatings(function(prev){
            let newUserRatings= [];
            for(let i=0; i<prev.length;i++) {
              if(i===props.index){
                newUserRatings.push(-1);
              }
              else {
                newUserRatings.push(prev[i]);
              }
            }
            return newUserRatings;
          })      
        }
        else if (props.rating===1){
          const getLikeDislikeId= await axios.get(`http://localhost:3001/video-rating`, {params: {UserId: props.userIdOfCurrentUser, VideoPostId: props.VideoPostId}});
          const LikeDislikeId= getLikeDislikeId.data[0].LikeDislikeId;
          const deleteOldRating = await axios.delete('http://localhost:3001/video', {params: {LikeDislikeId}});
          const addUpdatedRating = await axios.post(`http://localhost:3001/video-rating/${props.VideoPostId}`, {UserId: props.userIdOfCurrentUser, LikeStatus: false})
          props.setUserRatings(function(prev){
            let newUserRatings= [];
            for(let i=0; i<prev.length;i++) {
              if(i===props.index){
                newUserRatings.push(-1);
              }
              else {
                newUserRatings.push(prev[i]);
              }
            }
            return newUserRatings;
          }) 
          
        }
        else if (props.rating===-1){
          const getLikeDislikeId= await axios.get(`http://localhost:3001/video-rating`, {params: {UserId: props.userIdOfCurrentUser, VideoPostId: props.VideoPostId}});
          const LikeDislikeId= getLikeDislikeId.data[0].LikeDislikeId;
          const deleteOldRating = await axios.delete('http://localhost:3001/video', {params: {LikeDislikeId}});
          props.setUserRatings(function(prev){
            let newUserRatings= [];
            for(let i=0; i<prev.length;i++) {
              if(i===props.index){
                newUserRatings.push(0);
              }
              else {
                newUserRatings.push(prev[i]);
              }
            }
            return newUserRatings;
          }) 

        }

    }


    const highlightLikeButtonRating= {
        color: props.rating===1? "white":"black",
        backgroundColor: props.rating===1? "black": "white",
        border: '1px solid #153e59', // Set your desired border color
        borderRadius: '4px'
    };
    const highlightDislikeButtonRating= {
      color: props.rating===-1? "white":"black",
      backgroundColor: props.rating===-1? "black": "white",
      border: '1px solid #153e59', // Set your desired border color
      borderRadius: '4px'
  };

    return (
        <div>
            <h5>{props.username}</h5>
            <h6>{props.title}</h6>
            <iframe width="420" height="315" title= "Title" allow="fullscreen;"
                src={`https://www.youtube.com/embed/${props.VideoLinkId}`}>
            </iframe>
            <button onClick={handleLike} style={highlightLikeButtonRating}>Like </button>
            <button onClick={handleDislike} style={highlightDislikeButtonRating}>Dislike</button>
        </div>
    );
}

export default PostComponent;