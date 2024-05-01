import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from '../utils/AxiosWithCredentials';
import NavigationComponent from './Navigation';
import ViewUserPlaylistComponentCSS from "../css/viewuserplaylistcomponent.module.css";

export const ViewUserPlaylistComponent = ()=>{
    const {playlistID} = useParams()
    const {userID} = useParams()
    const [playlistVideosID, setPlaylistVideosID] = useState([])
    const [playlistVideos, setPlaylistVideos] = useState([])
    const navigate = useNavigate();


    useEffect(()=> {
        fetchAllPlaylistVideosID()
    }, [])

    //gets all videoIDs in the playlist
    const fetchAllPlaylistVideosID = async () => {
        try{
            const res = await axios.get("http://localhost:3001/fetchAllPlaylistVideosID", {
                params: { playlistID: playlistID, userID: userID}
            })
            setPlaylistVideosID(res.data)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(()=>{
        const fetchPlaylistVideos = async ()=>{
            try{
                let arr = []
                for(const videoPost of playlistVideosID){
                    const res = await axios.get("http://localhost:3001/fetchAllVideos", {
                        params: {videoPostID: videoPost.VideoPostID}
                    })
                    arr.push(res.data[0])
                }
                for(let  i = 0; i < arr.length; i++){
                    console.log("arr ", arr[i])
                }
                setPlaylistVideos(arr)
            } catch (error) {
                console.log(error)
            }
        }
        fetchPlaylistVideos()
    }, [playlistVideosID])

    const removeVideoFromPlaylist = async (videoPostID)=>{
        try{
            await axios.delete("http://localhost:3001/deleteVideoFromPlaylist", {
                params: {playlistID: playlistID, videoPostID: videoPostID}
            })
        } catch (error){
            console.log("Can't remove video")
        }
        fetchAllPlaylistVideosID()
    }
    
    return (
        <div>
            <NavigationComponent/>
            <h1 style={{padding: "20px"}}>Playlist Videos</h1>
            <div className={ViewUserPlaylistComponentCSS.playlistVideos}>
                {playlistVideos.length !== 0 ? (
                    playlistVideos.map(video => (
                        <div className={ViewUserPlaylistComponentCSS.videoContainer} key={video.VideoPostId}>
                            <h2>
                                <a 
                                    style={{textDecoration: 'none'}}
                                    onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                                    onMouseOut={(e) => e.target.style.textDecoration = 'none'}
                                    onClick={() => {navigate(`/username/${video.username}`)}}
                                >
                                    {video.username}
                                </a> 
                                ◦ {new Date(video.PostedAt).toLocaleString()}
                            </h2>
                            <h4 style={{fontWeight: "bold"}}> {video.Title} </h4>
                            <iframe style={{marginBottom: "8px"}} width="420" height="315" title= "Title" allow="fullscreen;"
                                src={`https://www.youtube.com/embed/${video.VideoLinkId}`}>
                            </iframe>
                            <div>
                                <button className="btn btn-primary" onClick={()=>navigate(`/video/${video.VideoPostId}`)}> View Post </button>
                                <button className="btn btn-danger" onClick={() => removeVideoFromPlaylist(video.VideoPostId)}>
                                    Remove Video
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{}}>
                        <Link to={`/`}><h2>No videos in this playlist. Perhaps add some?</h2></Link>
                    </div>
                )}
            </div>
        </div>
    )
}