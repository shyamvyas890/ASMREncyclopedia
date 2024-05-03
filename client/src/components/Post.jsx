import React, { useState, useEffect } from 'react';
import axios from '../utils/AxiosWithCredentials';
import { useNavigate } from 'react-router-dom';
import {Link} from "react-router-dom";
import VideoPostCSS from "../css/videopost.module.css"
import LikeDislikeIcon from './LikeDislikeIcon';

const PostComponent = (props) =>{
    const hostname= "http://localhost:3001";
    const [theGenres, setTheGenres]= useState(null);
    const [modal, setModal] = useState(false)
    const [userPlaylists, setUserPlaylists] = useState([])
    //contains [playlistID, bool] video is in playlist -> true
    const [userPlaylistIncludesVideo, setUserPlaylistIncludesVideo] = useState([])
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
    },[props.VideoPostId])

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

    const toggleModal = () => {
      setModal(!modal)
    }

  const fetchAllUserPlaylist = async () => {
    try{
      const res = await axios.get("http://localhost:3001/fetchAllUserPlaylists", {
        params: { userID: props.userIdOfCurrentUser}
      })
      setUserPlaylists(res.data)
      } catch (error) {
          console.log(error)
    }
  }

  //gets all user playlists that has the video
  const fetchVideoInPlaylist = async ()=>{
    try{
      let arr = [];
      for(const playlist of userPlaylists){
        const res = await axios.get("http://localhost:3001/fetchVideoInPlaylist", {
          params: { playlistID: playlist.PlaylistID, videoPostID: props.VideoPostId }
        })
        if(res.data.length !== 0){
          arr.push(playlist.PlaylistID)
        } 
      }
      setUserPlaylistIncludesVideo(arr)
    } catch (error) {
        console.log(error)
    }
  }
  
  //When clicked, removes/adds from playlist
  const handleCheckBox = async (PlaylistID)=>{
    try{
      if(userPlaylistIncludesVideo.includes(PlaylistID)){
        await axios.delete("http://localhost:3001/deleteVideoFromPlaylist", {
          params: { playlistID: PlaylistID, videoPostID: props.VideoPostId }
        })
      } else if(!userPlaylistIncludesVideo.includes(PlaylistID)){
          await axios.post("http://localhost:3001/addVideoToPlaylist", {},  { 
            params: { playlistID: PlaylistID, videoPostID: props.VideoPostId }
          })
      }
    } catch (error) {
      console.log(error)
    }
    fetchVideoInPlaylist()
  }

  useEffect(()=>{
    fetchAllUserPlaylist()
  }, [modal])

  useEffect(()=>{
    fetchVideoInPlaylist()
  }, [userPlaylists])

    return (
        <div className={VideoPostCSS['user-posts']}>
            <h2> <a 
              style={{textDecoration: 'underline', cursor:"pointer"}}
               onClick={() => {navigate(`/username/${props.username}`)}}
                 >
              {props.username}
             </a> 
             ◦ {new Date(props.timestamp).toLocaleString()}</h2>
             <h4 style={{fontWeight: "bold"}}> {props.title} </h4>
            { <iframe width="800" height="450" title= "Title" allow="fullscreen;"
                src={`https://www.youtube.com/embed/${props.VideoLinkId}`}>
            </iframe>}
            <div className="tag-container">
              Tag(s)
              {theGenres && theGenres.map((genre, index)=>(
                <React.Fragment key={index}>
                  <span className="tag">{genre.GenreName}</span>
                </React.Fragment>
              ))}
            </div>
            <div className={VideoPostCSS["button-container"]}> 
              <button className="btn btn-primary" onClick={()=>navigate(`/video/${props.VideoPostId}`)}> View Post </button>
              {props.totalLikes !== null? 
                <button className={`btn btn-primary ${props.rating == 1 ? "liked" : ""}`} 
                  onClick={handleLike}>
                  <LikeDislikeIcon type="like" />
                  ({props.totalLikes}) 
                </button> : <div> </div>}
              {props.totaDislikes !== null? 
                <button className={`btn btn-primary ${props.rating == -1 ? "disliked" : ""}`}
                  onClick={handleDislike}>
                  <LikeDislikeIcon type="dislike" />
                  ({props.totalDislikes})
                </button> : <div> </div>}
              <button onClick={toggleModal} className="btn btn-primary"> Add to Playlist</button>
              {modal &&(
                <div className={VideoPostCSS.modal}>
                  <div onClick={toggleModal} className={VideoPostCSS.overlay}></div>
                    <div className={VideoPostCSS.modalContent}>
                      {userPlaylists.length === 0 ? (
                      <div>
                        <a href="http://localhost:3000/userPlaylists">
                          <h2>Click to create a Playlist!</h2>
                        </a>
                      </div>
                      ) : (
                      userPlaylists.map(playlist => (
                        <div className={VideoPostCSS.modalContentContainer} key={playlist.playlistID}>
                          <div class="form-check">
                            <input
                              type="checkbox"
                              checked={userPlaylistIncludesVideo.includes(playlist.PlaylistID)}
                              onClick={() => handleCheckBox(playlist.PlaylistID)}
                            />
                          </div>
                          <h2>{playlist.PlaylistName}</h2>
                        </div>
                      ))
                    )}
                  <button className="btn btn-secondary"onClick={toggleModal}>Close</button>
                </div>
              </div>
              )}
            </div>
            
        </div>
    );
}

export default PostComponent;