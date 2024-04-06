import React from "react";
import axios from '../utils/AxiosWithCredentials';
import { useNavigate } from "react-router-dom";
import {hostname } from "../utils/utils";

const RandomVideoComponent = ()=>{
    const navigate = useNavigate();
    const [username, setUsername] = React.useState(null);
    const findRandomVideo = async ()=>{
        const theVideos = (await axios.get(`${hostname}/video`)).data;
        const randomIndex = Math.floor(Math.random()*theVideos.length);
        navigate(`/video/${theVideos[randomIndex].VideoPostId}`);
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
}
export default RandomVideoComponent;