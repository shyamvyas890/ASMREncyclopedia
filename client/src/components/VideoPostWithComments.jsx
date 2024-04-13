import React, { useState, useEffect} from 'react';
import axios from '../utils/AxiosWithCredentials';
import { useNavigate, useParams } from "react-router-dom";
import { VideoCommentContainerComponent } from './VideoCommentContainer';
import { Link } from 'react-router-dom';
import { axiosRequest, hostname } from '../utils/utils';
const VideoPostWithCommentsComponent = (props)=>{
    const navigate= useNavigate();
    const routerVideoPostId=useParams().VideoPostId;
    const propsVideoPostId = props.VideoPostId;
    const VideoPostId = routerVideoPostId || propsVideoPostId;
    const [username, setUsername]= React.useState(null);
    const [allTheVideoPostInformation, setAllTheVideoPostInformation]= useState(null);
    const [modal, setModal] = useState(false)
    const [userPlaylists, setUserPlaylists] = useState([])
    //contains [playlistID, bool] video is in playlist -> true
    const [userPlaylistIncludesVideo, setUserPlaylistIncludesVideo] = useState([])
    function changeTheRating(rating){
        setAllTheVideoPostInformation(prev=>({...prev, rating}))
    }
    const handleLike = async (e) => {
        e.preventDefault();
        if(allTheVideoPostInformation.rating===0){
          const axiosResponse = await axios.post(`${hostname}/video-rating/${allTheVideoPostInformation.VideoPostId}`, {UserId: username.userIdOfCurrentUser, LikeStatus: true})
          changeTheRating(1);      
        }
        else if (allTheVideoPostInformation.rating===-1){
          const getLikeDislikeId= await axios.get(`${hostname}/video-rating`, {params: {UserId: username.userIdOfCurrentUser, VideoPostId: allTheVideoPostInformation.VideoPostId}});
          const LikeDislikeId= getLikeDislikeId.data[0].LikeDislikeId;
          const deleteOldRating = await axios.delete(`${hostname}/video`, {params: {LikeDislikeId}});
          const addUpdatedRating = await axios.post(`${hostname}/video-rating/${allTheVideoPostInformation.VideoPostId}`, {UserId: username.userIdOfCurrentUser, LikeStatus: true})
          changeTheRating(1); 
          
        }
        else if (allTheVideoPostInformation.rating===1){
          const getLikeDislikeId= await axios.get(`${hostname}/video-rating`, {params: {UserId: username.userIdOfCurrentUser, VideoPostId: allTheVideoPostInformation.VideoPostId}});
          const LikeDislikeId= getLikeDislikeId.data[0].LikeDislikeId;
          const deleteOldRating = await axios.delete(`${hostname}/video`, {params: {LikeDislikeId}});
          changeTheRating(0)
        }
    }

    const handleDislike= async (e)=>{
        e.preventDefault();
        if(allTheVideoPostInformation.rating===0){
          const axiosResponse = await axios.post(`${hostname}/video-rating/${allTheVideoPostInformation.VideoPostId}`, {UserId: username.userIdOfCurrentUser, LikeStatus: false})
          changeTheRating(-1);   
        }
        else if (allTheVideoPostInformation.rating===1){
          const getLikeDislikeId= await axios.get(`${hostname}/video-rating`, {params: {UserId: username.userIdOfCurrentUser, VideoPostId: allTheVideoPostInformation.VideoPostId}});
          const LikeDislikeId= getLikeDislikeId.data[0].LikeDislikeId;
          const deleteOldRating = await axios.delete(`${hostname}/video`, {params: {LikeDislikeId}});
          const addUpdatedRating = await axios.post(`${hostname}/video-rating/${allTheVideoPostInformation.VideoPostId}`, {UserId: username.userIdOfCurrentUser, LikeStatus: false})
          changeTheRating(-1);
          
        }
        else if (allTheVideoPostInformation.rating===-1){
          const getLikeDislikeId= await axios.get(`${hostname}/video-rating`, {params: {UserId: username.userIdOfCurrentUser, VideoPostId: allTheVideoPostInformation.VideoPostId}});
          const LikeDislikeId= getLikeDislikeId.data[0].LikeDislikeId;
          const deleteOldRating = await axios.delete(`${hostname}/video`, {params: {LikeDislikeId}});
          changeTheRating(0);

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
            const userIdOfCurrentUser = (await axios.get(`${hostname}/users/id`, {params:{username:response.data.username}})).data.id;
            setUsername({userIdOfCurrentUser, username:response.data.username})
        }
        catch(error){
            navigate("/");
            console.log(error);
        }
    }

    const fetchInformation = async ()=>{
        try{

            console.log(VideoPostId)
            console.log(username.userIdOfCurrentUser)

            const videoBasicInfo= await axiosRequest(3,2, "video/id", {VideoPostId});
            videoBasicInfo.data[0].username= (await axios.get(`${hostname}/users/id`, 
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

    const toggleModal = () => {
      setModal(!modal)
      for(let playlist in userPlaylists)
        console.log("userID: ", playlist)
    }

  const fetchAllUserPlaylist = async () => {
    try{
      const res = await axios.get("http://localhost:3001/fetchAllUserPlaylists", {
        params: { userID: username.userIdOfCurrentUser}
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
            <button onClick={toggleModal} className="btn-Modal"> Add to Playlist</button>
            {modal && (
              <div className="modal">
                <div onClick={toggleModal} className="overlay"></div>
                <div className="modal-content">
                  {userPlaylists.map(playlist=>(
                  <div className="user-playlist" key={playlist.playlistID}>
                      <h2>{playlist.PlaylistName}</h2>
                      <label>
                        <input type="checkbox" 
                        checked={userPlaylistIncludesVideo.includes(playlist.PlaylistID)}
                        onClick={()=>handleCheckBox(playlist.PlaylistID)}
                        />
                      </label>
                  </div>
                  ))}
                <button className="close-modal"onClick={toggleModal}>Close</button>
              </div>
            </div>
            )}
            {routerVideoPostId && <VideoCommentContainerComponent
                VideoPostId= {allTheVideoPostInformation.VideoPostId}
                userIdOfCurrentUser= {username.userIdOfCurrentUser}
                usernameOfCurrentUser= {username.username}
            />}
        </div>)
    )


}

export default VideoPostWithCommentsComponent;
