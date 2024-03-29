import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {Link} from "react-router-dom";
const PostComponent = (props) =>{
    const hostname= "http://localhost:3001";
    const [theGenres, setTheGenres]= useState(null);
    const navigate = useNavigate();
    function changeTheRating(theRating){
      console.log("hello world")
      props.setVideoPostsAndRatings(function(prev){
        const newVideoPosts= [...prev];
        newVideoPosts[props.index].feedback=theRating
        const oldRating = props.rating;
        console.log(oldRating)
        const newRating = theRating;
        console.log(newRating)
        if(oldRating===0 && newRating===1){
          newVideoPosts[props.index].totalLikes++;
        }
        else if(oldRating===-1 && newRating===1){
          newVideoPosts[props.index].totalDislikes--;
          newVideoPosts[props.index].totalLikes++;
        }
        else if (oldRating===1 && newRating===0){
          newVideoPosts[props.index].totalLikes--;
        }
        else if (oldRating===0 && newRating===-1){
          newVideoPosts[props.index].totalDislikes++;
        }
        else if (oldRating===1 && newRating===-1){
          newVideoPosts[props.index].totalLikes--;
          newVideoPosts[props.index].totalDislikes++;
        }
        else if (oldRating===-1 && newRating===0){
          newVideoPosts[props.index].totalDislikes--;
        }
        console.log(newVideoPosts)
        return newVideoPosts;
      })
    }
    const handleLike = async (e) => {
        e.preventDefault();
        if(props.rating===0){
          const axiosResponse = await axios.post(`http://localhost:3001/video-rating/${props.VideoPostId}`, {UserId: props.userIdOfCurrentUser, LikeStatus: true})
          changeTheRating(1);      
        }
        else if (props.rating===-1){
          const getLikeDislikeId= await axios.get(`http://localhost:3001/video-rating`, {params: {UserId: props.userIdOfCurrentUser, VideoPostId: props.VideoPostId}});
          const LikeDislikeId= getLikeDislikeId.data[0].LikeDislikeId;
          const deleteOldRating = await axios.delete('http://localhost:3001/video', {params: {LikeDislikeId}});
          const addUpdatedRating = await axios.post(`http://localhost:3001/video-rating/${props.VideoPostId}`, {UserId: props.userIdOfCurrentUser, LikeStatus: true})
          changeTheRating(1); 
          
        }
        else if (props.rating===1){
          
          const getLikeDislikeId= await axios.get(`http://localhost:3001/video-rating`, {params: {UserId: props.userIdOfCurrentUser, VideoPostId: props.VideoPostId}});
          const LikeDislikeId= getLikeDislikeId.data[0].LikeDislikeId;
          const deleteOldRating = await axios.delete('http://localhost:3001/video', {params: {LikeDislikeId}});

          changeTheRating(0)
        }
    }
    const handleDelete = async (e) => {
      e.preventDefault();
      try {
        const deletionResponse = await axios.delete(`http://localhost:3001/video`, {params: {VideoPostId: props.VideoPostId}});
      }
      catch(err){
        console.log(err);
      }
      props.setVideoPostsAndRatings((prev)=>([...prev.slice(0, props.index), ...prev.slice(props.index+1)]))
    }
    const getGenres = async ()=>{
      const genres = await axios.get(`${hostname}/video-by-genre-or-user`, {params:{VideoPostId:props.VideoPostId}});
      for(const genre of genres.data) {
        const GenreName = await axios.get(`${hostname}/genreName`, {params:{GenreId: genre.GenreId}})
        genre.GenreName= GenreName.data[0].Genre;
      }
      setTheGenres(genres.data)
    }

    React.useEffect(()=>{
      getGenres();
    },[])
    const handleDislike= async (e)=>{
        e.preventDefault();
        if(props.rating===0){
          const axiosResponse = await axios.post(`http://localhost:3001/video-rating/${props.VideoPostId}`, {UserId: props.userIdOfCurrentUser, LikeStatus: false})
          changeTheRating(-1);   
        }
        else if (props.rating===1){
          const getLikeDislikeId= await axios.get(`http://localhost:3001/video-rating`, {params: {UserId: props.userIdOfCurrentUser, VideoPostId: props.VideoPostId}});
          const LikeDislikeId= getLikeDislikeId.data[0].LikeDislikeId;
          const deleteOldRating = await axios.delete('http://localhost:3001/video', {params: {LikeDislikeId}});
          const addUpdatedRating = await axios.post(`http://localhost:3001/video-rating/${props.VideoPostId}`, {UserId: props.userIdOfCurrentUser, LikeStatus: false})
          changeTheRating(-1);
          
        }
        else if (props.rating===-1){
          const getLikeDislikeId= await axios.get(`http://localhost:3001/video-rating`, {params: {UserId: props.userIdOfCurrentUser, VideoPostId: props.VideoPostId}});
          const LikeDislikeId= getLikeDislikeId.data[0].LikeDislikeId;
          const deleteOldRating = await axios.delete('http://localhost:3001/video', {params: {LikeDislikeId}});
          changeTheRating(0);

        }

    }


    const highlightLikeButtonRating= {
        color: props.rating===1? "white":"black",
        backgroundColor: props.rating===1? "black": "white",
        border: '1px solid #153e59', 
        borderRadius: '4px'
    };
    const highlightDislikeButtonRating= {
      color: props.rating===-1? "white":"black",
      backgroundColor: props.rating===-1? "black": "white",
      border: '1px solid #153e59', 
      borderRadius: '4px'
    };


    return (
        <div>
            <h5><Link to={`/username/${props.username}`}>{props.username}</Link></h5>
            <h6>{props.title}</h6>
            {/* <iframe width="420" height="315" title= "Title" allow="fullscreen;"
                src={`https://www.youtube.com/embed/${props.VideoLinkId}`}>
            </iframe> */}
            <h6>Posted At: {new Date(props.timestamp).toString()}</h6>
            <div>{props.VideoLinkId}</div>
            <h4>Tags</h4>
            {theGenres && theGenres.map((genre, index)=>(
              <React.Fragment key={index}>
                <div>{genre.GenreName}</div>
              </React.Fragment>
            ))}
            <button onClick={handleLike} style={highlightLikeButtonRating}>Like ({props.totalLikes}) </button>
            <button onClick={handleDislike} style={highlightDislikeButtonRating}>Dislike ({props.totalDislikes})</button>
            {props.username === props.usernameOfCurrentUser && <button onClick={handleDelete}>Delete</button>}
            <button onClick={()=>navigate(`/video/${props.VideoPostId}`)}>Comments</button>
        </div>
    );
}

export default PostComponent;