import { useState, useEffect } from "react";
import {useNavigate, useParams } from "react-router-dom";
import {axiosRequest} from "../utils/utils.js";

import * as yup from "yup"
import axios from "axios";
import PostComponent from "./Post";

export const ViewUserPlaylistComponent = ()=>{
    const {playlistID} = useParams()
    const {userID} = useParams()
    const [playlistVideosID, setPlaylistVideosID] = useState([])
    const [playlistVideos, setPlaylistVideos] = useState([])

    useEffect(()=> {
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

        fetchAllPlaylistVideosID()
    }, [])

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

    const fetchUsername = async ()=>{
        try{
            const res = await axios.get("http://localhost:3001/users/id", {
                params: {UserId: userID}
            })
            console.log(res.data)
            return res.data
        } catch{

        }
    }
    
    return (
        <div>
            <h1>Playlist Videos</h1>
            <div classname="playlist-videos">
                {playlistVideos.map(video=>(
                    <div className="video" key={video.VideoPostID}>
                        <h2>{video.Title}</h2>
                        <p>Posted at {video.PostedAt}</p>
                        <p>{video.VideoLinkId}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}