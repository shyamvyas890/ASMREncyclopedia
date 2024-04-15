import {useState, useEffect} from "react"
import axios from "../utils/AxiosWithCredentials"
import { ForumPostFeedComponent } from "./ForumPostFeed"
import { useNavigate } from "react-router-dom"

export const AllForumPostComponent = () =>{
    return(
    <div>
       <ForumPostFeedComponent /> 
    </div>)
    
}