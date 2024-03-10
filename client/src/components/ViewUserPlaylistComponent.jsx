import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

export const ViewUserPlaylistComponent = ()=>{
    const {playlistID} = useParams()
    const {userID} = useParams()
    const [playlistVideosID, setPlaylistVideosID] = useState([])
    const [playlistVideos, setPlaylistVideos] = useState([])

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
            <h1>Playlist Videos</h1>
            <div classname="playlist-videos">
                {playlistVideos.map(video=>(
                    <div className="video" key={video.VideoPostId}>
                    <h5><Link to={`/video/${video.VideoPostId}`}>{video.Title}</Link></h5>
                        <p>{video.VideoLinkId}</p>
                        <button 
                            className="remove-video-from-playlist"
                            onClick={()=>removeVideoFromPlaylist(video.VideoPostId)}>
                            Remove Video
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}