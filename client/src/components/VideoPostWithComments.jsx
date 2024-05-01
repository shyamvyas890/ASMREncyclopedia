import React, { useState, useEffect} from 'react';
import axios from '../utils/AxiosWithCredentials';
import { useNavigate, useParams } from "react-router-dom";
import { VideoCommentContainerComponent } from './VideoCommentContainer';
import { Link } from 'react-router-dom';
import { axiosRequest, hostname } from '../utils/utils';
import VideoPostWithCommentsCSS from "../css/videopostwithcomments.module.css"
import LikeDislikeIcon from './LikeDislikeIcon';

import NavigationComponent from './Navigation';
const VideoPostWithCommentsComponent = (props)=>{
    const navigate= useNavigate();
    const routerVideoPostId=useParams().VideoPostId;
    const propsVideoPostId = props.VideoPostId;
    const VideoPostId = routerVideoPostId || propsVideoPostId;
    const [username, setUsername]= useState();
    const [userID, setUserID] = useState()
    const [allTheVideoPostInformation, setAllTheVideoPostInformation]= useState(null);
    const [modal, setModal] = useState(false)
    const [userPlaylists, setUserPlaylists] = useState([])
    //contains [playlistID, bool] video is in playlist -> true
    const [userPlaylistIncludesVideo, setUserPlaylistIncludesVideo] = useState([])
    function changeTheRating(rating){
        setAllTheVideoPostInformation(prev=>({...prev, rating}))
    }
    function changeTotalLikesAndDislikes(deltaLikes, deltaDislikes){
      setAllTheVideoPostInformation(prev=>({...prev, totalLikes:prev.totalLikes+deltaLikes, totalDislikes:prev.totalDislikes+deltaDislikes}));
    }
    const handleLike = async (e) => {
        e.preventDefault();
        if(allTheVideoPostInformation.rating===0){
          const axiosResponse = await axios.post(`${hostname}/video-rating/${allTheVideoPostInformation.VideoPostId}`, {UserId: userID, LikeStatus: true})
          console.log(axiosResponse);
          changeTheRating(1);
          changeTotalLikesAndDislikes(1, 0);      
        }
        else if (allTheVideoPostInformation.rating===-1){
          const getLikeDislikeId= await axios.get(`${hostname}/video-rating`, {params: {UserId: userID, VideoPostId: allTheVideoPostInformation.VideoPostId}});
          const LikeDislikeId= getLikeDislikeId.data[0].LikeDislikeId;
          const deleteOldRating = await axios.delete(`${hostname}/video`, {params: {LikeDislikeId}});
          const addUpdatedRating = await axios.post(`${hostname}/video-rating/${allTheVideoPostInformation.VideoPostId}`, {UserId: userID, LikeStatus: true})
          changeTheRating(1); 
          changeTotalLikesAndDislikes(1, -1);
        }
        else if (allTheVideoPostInformation.rating===1){
          const getLikeDislikeId= await axios.get(`${hostname}/video-rating`, {params: {UserId: userID, VideoPostId: allTheVideoPostInformation.VideoPostId}});
          const LikeDislikeId= getLikeDislikeId.data[0].LikeDislikeId;
          const deleteOldRating = await axios.delete(`${hostname}/video`, {params: {LikeDislikeId}});
          changeTheRating(0)
          changeTotalLikesAndDislikes(-1, 0);
        }
    }

    const handleDislike= async (e)=>{
        e.preventDefault();
        if(allTheVideoPostInformation.rating===0){
          const axiosResponse = await axios.post(`${hostname}/video-rating/${allTheVideoPostInformation.VideoPostId}`, {UserId: userID, LikeStatus: false})
          changeTheRating(-1);
          changeTotalLikesAndDislikes(0, 1);
        }
        else if (allTheVideoPostInformation.rating===1){
          const getLikeDislikeId= await axios.get(`${hostname}/video-rating`, {params: {UserId: userID, VideoPostId: allTheVideoPostInformation.VideoPostId}});
          const LikeDislikeId= getLikeDislikeId.data[0].LikeDislikeId;
          const deleteOldRating = await axios.delete(`${hostname}/video`, {params: {LikeDislikeId}});
          const addUpdatedRating = await axios.post(`${hostname}/video-rating/${allTheVideoPostInformation.VideoPostId}`, {UserId: userID, LikeStatus: false})
          changeTheRating(-1);
          changeTotalLikesAndDislikes(-1, 1);
          
        }
        else if (allTheVideoPostInformation.rating===-1){
          const getLikeDislikeId= await axios.get(`${hostname}/video-rating`, {params: {UserId: userID, VideoPostId: allTheVideoPostInformation.VideoPostId}});
          const LikeDislikeId= getLikeDislikeId.data[0].LikeDislikeId;
          const deleteOldRating = await axios.delete(`${hostname}/video`, {params: {LikeDislikeId}});
          changeTheRating(0);
          changeTotalLikesAndDislikes(0, -1);

        }

    }
    const handleDelete = async (e) => {
        e.preventDefault();
        try {
          const deletionResponse = await axios.delete(`${hostname}/video`, {params: {VideoPostId: allTheVideoPostInformation.VideoPostId}});
          navigate("/");
        }
        catch(err){
          console.log(err);
        }
      }

    const tokenVerify= async (e) => {
        try{
            const response= await axios.get(`${hostname}/verify-token`)
            console.log(response);
            const userIdOfCurrentUser = (await axios.get(`${hostname}/users/id`, {params:{username:response.data.username}})).data.id;
            console.log("THE ID IS: " + userIdOfCurrentUser)
            setUserID(userIdOfCurrentUser)
            setUsername(response.data.username)
        }
        catch(error){
            navigate("/");
            console.log(error);
        }
    }

    const fetchInformation = async ()=>{
        try{
            console.log(VideoPostId)
            console.log(userID)
            const videoBasicInfo= await axiosRequest(3,2, "video/id", {VideoPostId});
            videoBasicInfo.data[0].username= (await axios.get(`${hostname}/users/id`, 
            {
                params:{ UserId:videoBasicInfo.data[0].UserId }
            })).data.username;
            const rating= await axiosRequest(3,2,"video-rating", {UserId:userID, VideoPostId});
            const genres= await axiosRequest(3,2,"video-by-genre-or-user", {VideoPostId});
            for(const genre of genres.data) {
                const GenreName = await axios.get(`${hostname}/genreName`, {params:{GenreId: genre.GenreId}})
                genre.GenreName= GenreName.data[0].Genre;
            }
            const totalVideoRatingData = await axiosRequest(3,2, "video-rating", {VideoPostId})
            let totalLikes = 0;
            let totalDislikes = 0;
            for (const rating of totalVideoRatingData.data){
              if(rating.LikeStatus === 0){
                totalDislikes++;
              }
              else if(rating.LikeStatus === 1){
                totalLikes++;
              }
            }
            const theInfo= {...videoBasicInfo.data[0], rating:rating.data.length===0 ? 0:rating.data[0].LikeStatus===1 ? 1:-1, genres:genres.data, totalLikes, totalDislikes};
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
        fetchAllUserPlaylist()
    },[]);

    React.useEffect(()=>{
        if(username){
            fetchInformation();
        }
    }, [username])

    const toggleModal = () => {
      setModal(!modal)
      for(let playlist in userPlaylists)
        console.log("userID: ", playlist)
    }

  const fetchAllUserPlaylist = async () => {
    try{
      //check if username is null first
      if (username !== null && userID !== null) {
        const res = await axios.get("http://localhost:3001/fetchAllUserPlaylists", {
          params: { userID: userID}
        })
        setUserPlaylists(res.data)
      }
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
          params: { playlistID: playlist.PlaylistID, videoPostID: allTheVideoPostInformation.VideoPostId }
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
          params: { playlistID: PlaylistID, videoPostID: allTheVideoPostInformation.VideoPostId }
        })
      } else if(!userPlaylistIncludesVideo.includes(PlaylistID)){
          await axios.post("http://localhost:3001/addVideoToPlaylist", {},  { 
            params: { playlistID: PlaylistID, videoPostID: allTheVideoPostInformation.VideoPostId }
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
        allTheVideoPostInformation!==null && (
        <div>
          <NavigationComponent />

          <div className={VideoPostWithCommentsCSS['user-posts']}>
          <h2> <a 
              style={{textDecoration: 'none'}}
              onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
              onMouseOut={(e) => e.target.style.textDecoration = 'none'}
               onClick={() => {navigate(`/username/${allTheVideoPostInformation.username}`)}}
                 >
              {allTheVideoPostInformation.username}
             </a> 
             ◦ {new Date(allTheVideoPostInformation.PostedAt).toLocaleString()}</h2>
             <h4 style={{fontWeight: "bold"}}> {allTheVideoPostInformation.Title} </h4>
             {/* { <iframe width="420" height="315" title= "Title" allow="fullscreen;"
                src={`https://www.youtube.com/embed/${allTheVideoPostInformation.VideoLinkId}`}>
            </iframe>} */}
            <div className="tag-container">
              Tag(s)
              {allTheVideoPostInformation.genres.map((genre, index)=>(
                <React.Fragment key={index}>
                  <span className="tag">{genre.GenreName}</span>
                </React.Fragment>
              ))}
            </div>
            <button className={`btn btn-primary ${allTheVideoPostInformation.rating == 1 ? "liked" : ""}`} 
              onClick={handleLike}>
                <LikeDislikeIcon type="like" />
                {`(${allTheVideoPostInformation.totalLikes})`}
              </button>
            <button className={`btn btn-primary ${allTheVideoPostInformation.rating == -1 ? "disliked" : ""}`} 
              onClick={handleDislike}>
              <LikeDislikeIcon type="dislike" />
              {`(${allTheVideoPostInformation.totalDislikes})`}
            </button>
            {allTheVideoPostInformation.UserId===userID && <button className="btn btn-danger" onClick={handleDelete}>Delete</button>}
            <button onClick={toggleModal} className="btn btn-primary"> Add to Playlist</button>
            {modal && (
              <div className={VideoPostWithCommentsCSS.modal}>
                <div onClick={toggleModal} className={VideoPostWithCommentsCSS.overlay}></div>
                <div className={VideoPostWithCommentsCSS.modalContent}>
                {userPlaylists.length === 0 ? (
                    <div>
                      <a href="http://localhost:3000/userPlaylists">
                        <h2>Click to create a Playlist!</h2>
                      </a>
                    </div>
                    ) : (
                    userPlaylists.map(playlist => (
                      <div className={VideoPostWithCommentsCSS.modalContentContainer} key={playlist.playlistID}>
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
                <button className="btn btn-secondary" onClick={toggleModal}>Close</button>
              </div>
            </div>
            )}
          </div>
          <div className={VideoPostWithCommentsCSS['video-post-comments-section']}>
            {routerVideoPostId && <VideoCommentContainerComponent
                VideoPostId= {allTheVideoPostInformation.VideoPostId}
                userIdOfCurrentUser= {userID}
                usernameOfCurrentUser= {username}
            />}
          </div>
        </div>
            )
    )
}

export default VideoPostWithCommentsComponent;
