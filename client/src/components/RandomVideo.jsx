import React from "react";
import axios from '../utils/AxiosWithCredentials';
import { useNavigate } from "react-router-dom";
import {hostname } from "../utils/utils";
import RandomCSS from "../css/RandomVideo.module.css"
const RandomVideoComponent = ()=>{
    const navigate = useNavigate();
    const [username, setUsername] = React.useState(null);
    const [noVideos, setNoVideos] = React.useState(false)
    const findRandomVideo = async ()=>{
        const theVideos = (await axios.get(`${hostname}/video`)).data;
        const randomIndex = Math.floor(Math.random()*theVideos.length);
        console.log(randomIndex)
        if(theVideos.length === 0 ){
            setNoVideos(true)

        }
        else {
            navigate(`/video/${theVideos[randomIndex].VideoPostId}`);
        }
    }
    const tokenVerify= async () => {
        try{
            const response= await axios.get(`http://localhost:3001/verify-token`)
            setUsername(response.data.username)
        }
        catch(error){
            navigate("/");
            console.log(error);
        }
    }
    React.useEffect(()=>{
        tokenVerify()
    }, [])
    React.useEffect(()=>{
        if(username){
            findRandomVideo();
        }
    },[username]);

    return (
        noVideos && 
            <a className= {RandomCSS["no-posts"]} onClick={()=>{navigate("/")}}>There are no videos present. Click here to add some!</a>
    )

}
export default RandomVideoComponent;