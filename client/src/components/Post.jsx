import React from 'react';
import axios from 'axios';
const PostComponent = (props) =>{

    function changeTheRating(theRating){
      props.setVideoPostsAndRatings(function(prev){
        let newUserRatings= [...prev.userRatings];
        newUserRatings[props.index]=theRating;
        const newVideoPosts= prev.videoPosts;
        return {
          videoPosts:newVideoPosts,
          userRatings: newUserRatings
        }
      })
    }
    const handleLike = async (e) => {
        e.preventDefault();
        if(props.rating===0){
          const axiosResponse = await axios.post(`http://localhost:3001/video-rating/${props.VideoPostId}`, {UserId: props.userIdOfCurrentUser, LikeStatus: true})
          console.log(axiosResponse);
          changeTheRating(1);      
        }
        else if (props.rating===-1){
          const getLikeDislikeId= await axios.get(`http://localhost:3001/video-rating`, {params: {UserId: props.userIdOfCurrentUser, VideoPostId: props.VideoPostId}});
          const LikeDislikeId= getLikeDislikeId.data[0].LikeDislikeId;
          const deleteOldRating = await axios.delete('http://localhost:3001/video', {params: {LikeDislikeId}});
          console.log(deleteOldRating)
          const addUpdatedRating = await axios.post(`http://localhost:3001/video-rating/${props.VideoPostId}`, {UserId: props.userIdOfCurrentUser, LikeStatus: true})
          console.log(addUpdatedRating);
          changeTheRating(1); 
          
        }
        else if (props.rating===1){
          const getLikeDislikeId= await axios.get(`http://localhost:3001/video-rating`, {params: {UserId: props.userIdOfCurrentUser, VideoPostId: props.VideoPostId}});
          console.log(getLikeDislikeId);
          const LikeDislikeId= getLikeDislikeId.data[0].LikeDislikeId;
          const deleteOldRating = await axios.delete('http://localhost:3001/video', {params: {LikeDislikeId}});
          console.log(deleteOldRating);

          changeTheRating(0)
        }
    }
    const handleDelete = async (e) => {
      e.preventDefault();
      const deletionResponse = await axios.delete(`http://localhost:3001/video`, {params: {VideoPostId: props.VideoPostId}});
      console.log(deletionResponse);
      props.setVideoPostsAndRatings((prev)=>{
        const newUserRatings= [...prev.userRatings.slice(0, props.index), ...prev.userRatings.slice(props.index+1)];
        const newVideoPosts= [...prev.videoPosts.slice(0, props.index), ...prev.videoPosts.slice(props.index+1)];
        return {
          videoPosts:newVideoPosts,
          userRatings: newUserRatings
        }
      })
    }

    const handleDislike= async (e)=>{
        e.preventDefault();
        if(props.rating===0){
          const axiosResponse = await axios.post(`http://localhost:3001/video-rating/${props.VideoPostId}`, {UserId: props.userIdOfCurrentUser, LikeStatus: false})
          console.log(axiosResponse)
          changeTheRating(-1);   
        }
        else if (props.rating===1){
          const getLikeDislikeId= await axios.get(`http://localhost:3001/video-rating`, {params: {UserId: props.userIdOfCurrentUser, VideoPostId: props.VideoPostId}});
          const LikeDislikeId= getLikeDislikeId.data[0].LikeDislikeId;
          console.log(getLikeDislikeId)
          const deleteOldRating = await axios.delete('http://localhost:3001/video', {params: {LikeDislikeId}});
          console.log(deleteOldRating)
          const addUpdatedRating = await axios.post(`http://localhost:3001/video-rating/${props.VideoPostId}`, {UserId: props.userIdOfCurrentUser, LikeStatus: false})
          console.log(addUpdatedRating)
          changeTheRating(-1);
          
        }
        else if (props.rating===-1){
          const getLikeDislikeId= await axios.get(`http://localhost:3001/video-rating`, {params: {UserId: props.userIdOfCurrentUser, VideoPostId: props.VideoPostId}});
          console.log(getLikeDislikeId)
          const LikeDislikeId= getLikeDislikeId.data[0].LikeDislikeId;
          const deleteOldRating = await axios.delete('http://localhost:3001/video', {params: {LikeDislikeId}});
          console.log(deleteOldRating)
          changeTheRating(0);

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
            {props.username === props.usernameOfCurrentUser && <button onClick={handleDelete}>Delete</button>}
        </div>
    );
}

export default PostComponent;