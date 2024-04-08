import React from "react";
import axios from '../utils/AxiosWithCredentials';
import { useNavigate } from "react-router-dom";
import {hostname } from "../utils/utils";

const RandomVideoComponent = ()=>{
    const navigate = useNavigate();
    const findRandomVideo = async ()=>{
        const theVideos = (await axios.get(`${hostname}/video`)).data;
        const randomIndex = Math.floor(Math.random()*theVideos.length);
        navigate(`/video/${theVideos[randomIndex].VideoPostId}`);
    }
    React.useEffect(()=>{
        findRandomVideo();
    },[]);
}
export default RandomVideoComponent;