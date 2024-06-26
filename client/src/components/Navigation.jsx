import React from 'react';
import {Link, useLocation, useNavigate} from "react-router-dom";
import NotificationsComponent from './Notifications';
import 'bootstrap/dist/css/bootstrap.min.css';
import "../css/navigation.css"
import logo from "../images/ASMRlogo.png"
import { Navigate } from 'react-router-dom';
import axios from '../utils/AxiosWithCredentials';
import {useState } from 'react';


const NavigationComponent= () => {
    const location = useLocation().pathname; 
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);

    const handleLogout = async (e) => {

  

      try {await axios.post(`http://localhost:3001/logout/`);}
      catch(error){
        console.log(error);
      } 
      window.location.reload();
    }
    const tokenVerify= async (e) => {
      try{
          const response= await axios.get(`http://localhost:3001/verify-token`)
      }
      catch(error){
        console.log(error)
      }
    
  }

  React.useEffect(()=>{
    tokenVerify();
  }, []);

    return(
      <nav class="navbar navbar-expand-lg navbar-light bg-dark">
    
       <div class="collapse navbar-collapse" id="navbarSupportedContent">
       <a class="navbar-brand" href="/"> 
         <img src={logo} width={30} height={30} />  
       </a>
         <ul class="navbar-nav mr-auto">

           <li class="nav-item" onClick={()=>{navigate("/")}}>
            
            <svg xmlns="http://www.w3.org/2000/svg" style={{stroke: "white"}} strokeWidth="1.5" viewBox="0 0 50 50" width="24px" height="24px"><path d="M 24.962891 1.0546875 A 1.0001 1.0001 0 0 0 24.384766 1.2636719 L 1.3847656 19.210938 A 1.0005659 1.0005659 0 0 0 2.6152344 20.789062 L 4 19.708984 L 4 46 A 1.0001 1.0001 0 0 0 5 47 L 18.832031 47 A 1.0001 1.0001 0 0 0 19.158203 47 L 30.832031 47 A 1.0001 1.0001 0 0 0 31.158203 47 L 45 47 A 1.0001 1.0001 0 0 0 46 46 L 46 19.708984 L 47.384766 20.789062 A 1.0005657 1.0005657 0 1 0 48.615234 19.210938 L 41 13.269531 L 41 6 L 35 6 L 35 8.5859375 L 25.615234 1.2636719 A 1.0001 1.0001 0 0 0 24.962891 1.0546875 z M 25 3.3222656 L 44 18.148438 L 44 45 L 32 45 L 32 26 L 18 26 L 18 45 L 6 45 L 6 18.148438 L 25 3.3222656 z M 37 8 L 39 8 L 39 11.708984 L 37 10.146484 L 37 8 z M 20 28 L 30 28 L 30 45 L 20 45 L 20 28 z"/></svg>
            
           </li>

           <li class="nav-item" onClick={()=>{navigate("/forumPosts")}}>
           

            <svg xmlns="http://www.w3.org/2000/svg" style={{stroke: "white"}} strokeWidth="5.0"id="Layer_1" data-name="Layer 1"width="24px" height="24px" viewBox="0 0 122 112"><path class="cls-1" d="M109.28,19.61l12.21,9.88a3.77,3.77,0,0,1,.56,5.29l-5.46,6.75L98.53,26.93,104,20.17a3.79,3.79,0,0,1,5.29-.56ZM21.07,30.81a3.18,3.18,0,0,1,0-6.36H74.12a3.18,3.18,0,0,1,0,6.36ZM9.49,0H85.71A9.53,9.53,0,0,1,95.2,9.49v5.63l-4.48,5.53a9.81,9.81,0,0,0-1.18,1.85c-.24.19-.48.4-.71.62V9.49a3.14,3.14,0,0,0-3.12-3.13H9.49A3.14,3.14,0,0,0,6.36,9.49v93.06a3.16,3.16,0,0,0,.92,2.21,3.11,3.11,0,0,0,2.21.92H85.71a3.12,3.12,0,0,0,3.12-3.13V88.2l1.91-.81a10,10,0,0,0,4.34-3.13l.12-.14v18.43A9.54,9.54,0,0,1,85.71,112H9.49A9.51,9.51,0,0,1,0,102.55V9.49A9.53,9.53,0,0,1,9.49,0ZM21.07,87.6a3.19,3.19,0,0,1,0-6.37H56.19a37.1,37.1,0,0,0-.3,6.37Zm0-18.93a3.19,3.19,0,0,1,0-6.37H59.22l0,.27-1.05,6.1Zm0-18.93a3.18,3.18,0,0,1,0-6.36H72.44l-5.11,6.36ZM87.25,78,74.43,83.47c-9.35,3.47-8.93,5.43-8-3.85L69.24,63.4h0l0,0,26.56-33,18,14.6L87.27,78ZM72.31,65.89l11.86,9.59-8.42,3.6c-6.6,2.83-6.42,4.23-5.27-2.53l1.83-10.66Z"/></svg>
           
           </li>

           <li class="nav-item" onClick={()=>{navigate("/friends")}}>
           
            <svg xmlns="http://www.w3.org/2000/svg" style={{stroke: "white"}} strokeWidth="50.0" width="30px" height="30px" viewBox="0 0 1024 1024"><path d="M490.6 476.7c-76 0-137.9-61.9-137.9-137.9s61.9-137.9 137.9-137.9 137.9 61.9 137.9 137.9-61.8 137.9-137.9 137.9z m0-242.6c-57.7 0-104.6 47-104.6 104.6 0 57.7 46.9 104.7 104.6 104.7 57.7 0 104.6-47 104.6-104.6 0.1-57.7-46.8-104.7-104.6-104.7zM295.7 467.2c-2 0-4-0.3-6-1.1-23.5-9.1-43.7-24.9-58.2-45.7-14.9-21.3-22.8-46.4-22.8-72.4 0-69.8 56.8-126.6 126.6-126.6 9.2 0 16.6 7.5 16.6 16.6 0 9.2-7.4 16.6-16.6 16.6-51.5 0-93.3 41.8-93.3 93.3 0 38.3 24 73.3 59.7 87.1 8.6 3.3 12.8 13 9.5 21.5-2.5 6.7-8.9 10.7-15.5 10.7z m434.3 248c-9.2 0-16.6-7.4-16.6-16.6 0-71-32.7-136.2-89.8-178.7-7.4-5.5-8.9-15.9-3.4-23.3s15.9-8.9 23.3-3.4c31.3 23.3 57.3 54 75 88.7 18.7 36.3 28.1 75.6 28.1 116.7 0 9.1-7.5 16.6-16.6 16.6z m0 0" fill="#333333"/><path d="M171.2 645.9c-0.7 0-1.4-0.1-2.1-0.1-9.1-1.1-15.6-9.4-14.4-18.6 5.1-40.8 19.3-78.6 42.2-112.4 22-32.2 51.4-59.4 85.4-78.8 8-4.5 18.2-1.7 22.7 6.3s1.7 18.2-6.3 22.7c-61.9 35.2-102.4 95.8-111.1 166.3-0.9 8.5-8 14.6-16.4 14.6z m80.1 70.1c-9.2 0-16.6-7.5-16.6-16.6 0-34.5 6.8-68 20.2-99.6 12.9-30.5 31.3-57.9 54.9-81.3 23.5-23.5 50.9-42 81.3-54.9 31.6-13.4 65.1-20.2 99.6-20.2 9.2 0 16.6 7.4 16.6 16.6 0 9.2-7.5 16.6-16.6 16.6-122.8 0-222.7 99.9-222.7 222.7 0 9.2-7.5 16.7-16.7 16.7z m0 0"/></svg>
           
           </li>

           <li class="nav-item" onClick={()=>{navigate("/messages")}}>
             
             <svg xmlns="http://www.w3.org/2000/svg" style={{stroke: "white"}} fill="FFFFFF" strokeWidth="9" height="24px" width="24px" version="1.1"  viewBox="0 0 217 217">
               <path d="M108.881,5.334C48.844,5.334,0,45.339,0,94.512c0,28.976,16.84,55.715,45.332,72.454  c-3.953,18.48-12.812,31.448-12.909,31.588l-9.685,13.873l16.798-2.153c1.935-0.249,47.001-6.222,79.122-26.942  c26.378-1.92,50.877-11.597,69.181-27.364c19.296-16.623,29.923-38.448,29.923-61.455C217.762,45.339,168.918,5.334,108.881,5.334z   M115.762,168.489l-2.049,0.117l-1.704,1.145c-18.679,12.548-43.685,19.509-59.416,22.913c3.3-7.377,6.768-17.184,8.499-28.506  l0.809-5.292l-4.741-2.485C30.761,142.547,15,119.42,15,94.512c0-40.901,42.115-74.178,93.881-74.178s93.881,33.276,93.881,74.178  C202.762,133.194,164.547,165.688,115.762,168.489z"/>
             </svg>
             
           </li>

           <li class="nav-item" onClick={()=>{navigate("/random")}}>
             
             <svg xmlns="http://www.w3.org/2000/svg" fill="#FFFFFF" width="24px" height="24px" viewBox="0 0 973 973">
              <g>
	             <path d="M502.29,788.199h-47c-33.1,0-60,26.9-60,60v64.9c0,33.1,26.9,60,60,60h47c33.101,0,60-26.9,60-60v-64.9   C562.29,815,535.391,788.199,502.29,788.199z"/>
	             <path d="M170.89,285.8l86.7,10.8c27.5,3.4,53.6-12.4,63.5-38.3c12.5-32.7,29.9-58.5,52.2-77.3c31.601-26.6,70.9-40,117.9-40   c48.7,0,87.5,12.8,116.3,38.3c28.8,25.6,43.1,56.2,43.1,92.1c0,25.8-8.1,49.4-24.3,70.8c-10.5,13.6-42.8,42.2-96.7,85.9   c-54,43.7-89.899,83.099-107.899,118.099c-18.4,35.801-24.8,75.5-26.4,115.301c-1.399,34.1,25.8,62.5,60,62.5h49   c31.2,0,57-23.9,59.8-54.9c2-22.299,5.7-39.199,11.301-50.699c9.399-19.701,33.699-45.701,72.699-78.1   C723.59,477.8,772.79,428.4,795.891,392c23-36.3,34.6-74.8,34.6-115.5c0-73.5-31.3-138-94-193.4c-62.6-55.4-147-83.1-253-83.1   c-100.8,0-182.1,27.3-244.1,82c-52.8,46.6-84.9,101.8-96.2,165.5C139.69,266.1,152.39,283.5,170.89,285.8z"/>
              </g>
             </svg>
             
           </li>

           <li class="nav-item" onClick={()=>{navigate("/userPlaylists")}}>
            
            <svg xmlns="http://www.w3.org/2000/svg" fill="#FFFFFF" height="24px" width="24px"  viewBox="0 0 512 512">
              <g>
	              <path d="M48,64h160c17.672,0,32-14.328,32-32c0-17.674-14.328-32-32-32H48C30.328,0,16,14.326,16,32C16,49.672,30.328,64,48,64z"/>
	              <path d="M48,160h160c17.672,0,32-14.328,32-32c0-17.674-14.328-32-32-32H48c-17.672,0-32,14.326-32,32   C16,145.672,30.328,160,48,160z"/>
	              <path d="M240,224c0-17.674-14.328-32-32-32H48c-17.672,0-32,14.326-32,32c0,17.672,14.328,32,32,32h160   C225.672,256,240,241.672,240,224z"/>
	              <path d="M411.328,75.914C393.043,61.805,368,42.477,368,32c0-17.672-14.328-32-32-32s-32,14.328-32,32v293.58   c-10.023-3.549-20.762-5.58-32-5.58c-53.02,0-96,42.98-96,96s42.98,96,96,96s96-42.98,96-96V123.293   c1.414,1.094,2.82,2.203,4.23,3.293c36.105,27.852,59.77,48.078,59.77,74.305c0,40.766-21.684,63.516-22.305,64.164   c-12.672,12.32-12.961,32.578-0.641,45.25c6.273,6.453,14.605,9.695,22.949,9.695c8.035,0,16.082-3.008,22.301-9.055   c4.27-4.148,41.695-42.484,41.695-110.055C496,141.25,449.051,105.023,411.328,75.914z"/>
              </g>
           </svg>
          
           </li>

           <li class="nav-item" onClick={()=>{navigate("/settings")}}>
            
            <svg xmlns="http://www.w3.org/2000/svg" fill="#FFFFFF" height="24px" width="24px" viewBox="0 0 54 54">
             <path d="M51.22,21h-5.052c-0.812,0-1.481-0.447-1.792-1.197s-0.153-1.54,0.42-2.114l3.572-3.571   c0.525-0.525,0.814-1.224,0.814-1.966c0-0.743-0.289-1.441-0.814-1.967l-4.553-4.553c-1.05-1.05-2.881-1.052-3.933,0l-3.571,3.571   c-0.574,0.573-1.366,0.733-2.114,0.421C33.447,9.313,33,8.644,33,7.832V2.78C33,1.247,31.753,0,30.22,0H23.78   C22.247,0,21,1.247,21,2.78v5.052c0,0.812-0.447,1.481-1.197,1.792c-0.748,0.313-1.54,0.152-2.114-0.421l-3.571-3.571   c-1.052-1.052-2.883-1.05-3.933,0l-4.553,4.553c-0.525,0.525-0.814,1.224-0.814,1.967c0,0.742,0.289,1.44,0.814,1.966l3.572,3.571   c0.573,0.574,0.73,1.364,0.42,2.114S8.644,21,7.832,21H2.78C1.247,21,0,22.247,0,23.78v6.439C0,31.753,1.247,33,2.78,33h5.052   c0.812,0,1.481,0.447,1.792,1.197s0.153,1.54-0.42,2.114l-3.572,3.571c-0.525,0.525-0.814,1.224-0.814,1.966   c0,0.743,0.289,1.441,0.814,1.967l4.553,4.553c1.051,1.051,2.881,1.053,3.933,0l3.571-3.572c0.574-0.573,1.363-0.731,2.114-0.42   c0.75,0.311,1.197,0.98,1.197,1.792v5.052c0,1.533,1.247,2.78,2.78,2.78h6.439c1.533,0,2.78-1.247,2.78-2.78v-5.052   c0-0.812,0.447-1.481,1.197-1.792c0.751-0.312,1.54-0.153,2.114,0.42l3.571,3.572c1.052,1.052,2.883,1.05,3.933,0l4.553-4.553   c0.525-0.525,0.814-1.224,0.814-1.967c0-0.742-0.289-1.44-0.814-1.966l-3.572-3.571c-0.573-0.574-0.73-1.364-0.42-2.114   S45.356,33,46.168,33h5.052c1.533,0,2.78-1.247,2.78-2.78V23.78C54,22.247,52.753,21,51.22,21z M52,30.22   C52,30.65,51.65,31,51.22,31h-5.052c-1.624,0-3.019,0.932-3.64,2.432c-0.622,1.5-0.295,3.146,0.854,4.294l3.572,3.571   c0.305,0.305,0.305,0.8,0,1.104l-4.553,4.553c-0.304,0.304-0.799,0.306-1.104,0l-3.571-3.572c-1.149-1.149-2.794-1.474-4.294-0.854   c-1.5,0.621-2.432,2.016-2.432,3.64v5.052C31,51.65,30.65,52,30.22,52H23.78C23.35,52,23,51.65,23,51.22v-5.052   c0-1.624-0.932-3.019-2.432-3.64c-0.503-0.209-1.021-0.311-1.533-0.311c-1.014,0-1.997,0.4-2.761,1.164l-3.571,3.572   c-0.306,0.306-0.801,0.304-1.104,0l-4.553-4.553c-0.305-0.305-0.305-0.8,0-1.104l3.572-3.571c1.148-1.148,1.476-2.794,0.854-4.294   C10.851,31.932,9.456,31,7.832,31H2.78C2.35,31,2,30.65,2,30.22V23.78C2,23.35,2.35,23,2.78,23h5.052   c1.624,0,3.019-0.932,3.64-2.432c0.622-1.5,0.295-3.146-0.854-4.294l-3.572-3.571c-0.305-0.305-0.305-0.8,0-1.104l4.553-4.553   c0.304-0.305,0.799-0.305,1.104,0l3.571,3.571c1.147,1.147,2.792,1.476,4.294,0.854C22.068,10.851,23,9.456,23,7.832V2.78   C23,2.35,23.35,2,23.78,2h6.439C30.65,2,31,2.35,31,2.78v5.052c0,1.624,0.932,3.019,2.432,3.64   c1.502,0.622,3.146,0.294,4.294-0.854l3.571-3.571c0.306-0.305,0.801-0.305,1.104,0l4.553,4.553c0.305,0.305,0.305,0.8,0,1.104   l-3.572,3.571c-1.148,1.148-1.476,2.794-0.854,4.294c0.621,1.5,2.016,2.432,3.64,2.432h5.052C51.65,23,52,23.35,52,23.78V30.22z"/> 
             <path d="M27,18c-4.963,0-9,4.037-9,9s4.037,9,9,9s9-4.037,9-9S31.963,18,27,18z M27,34c-3.859,0-7-3.141-7-7s3.141-7,7-7   s7,3.141,7,7S30.859,34,27,34z"/>
            </svg>
            
           </li>

           <li class="nav-item" onClick={handleLogout}>
            
            <svg xmlns="http://www.w3.org/2000/svg" fill="#FFFFFF" height="24px" width="24px"  viewBox="0 0 385 385">
		         <path d="M180.455,360.91H24.061V24.061h156.394c6.641,0,12.03-5.39,12.03-12.03s-5.39-12.03-12.03-12.03H12.03    C5.39,0.001,0,5.39,0,12.031V372.94c0,6.641,5.39,12.03,12.03,12.03h168.424c6.641,0,12.03-5.39,12.03-12.03    C192.485,366.299,187.095,360.91,180.455,360.91z"/>
		         <path d="M381.481,184.088l-83.009-84.2c-4.704-4.752-12.319-4.74-17.011,0c-4.704,4.74-4.704,12.439,0,17.179l62.558,63.46H96.279    c-6.641,0-12.03,5.438-12.03,12.151c0,6.713,5.39,12.151,12.03,12.151h247.74l-62.558,63.46c-4.704,4.752-4.704,12.439,0,17.179    c4.704,4.752,12.319,4.752,17.011,0l82.997-84.2C386.113,196.588,386.161,188.756,381.481,184.088z"/>
           </svg>
            
           </li>
           <li class="nav-item" onClick={()=>{navigate("/about-us")}}>
            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" style={{stroke: "white"}} fill="#FFFFFF" width="24px" height="24px" viewBox="0 0 50 50">
              <path d="M 25 2 C 12.309295 2 2 12.309295 2 25 C 2 37.690705 12.309295 48 25 48 C 37.690705 48 48 37.690705 48 25 C 48 12.309295 37.690705 2 25 2 z M 25 4 C 36.609824 4 46 13.390176 46 25 C 46 36.609824 36.609824 46 25 46 C 13.390176 46 4 36.609824 4 25 C 4 13.390176 13.390176 4 25 4 z M 25 11 A 3 3 0 0 0 22 14 A 3 3 0 0 0 25 17 A 3 3 0 0 0 28 14 A 3 3 0 0 0 25 11 z M 21 21 L 21 23 L 22 23 L 23 23 L 23 36 L 22 36 L 21 36 L 21 38 L 22 38 L 23 38 L 27 38 L 28 38 L 29 38 L 29 36 L 28 36 L 27 36 L 27 21 L 26 21 L 22 21 L 21 21 z"></path>
            </svg>
           </li>

         {location !== "/notifications" && <li class="nav-item" onClick= {()=>{setShowDropdown(prev=>!prev)}}  >
           <NotificationsComponent showDropdown={showDropdown}/>
         </li>}
    </ul>

    <form onSubmit={(e) => {
      e.preventDefault(); 
      navigate(`/searchResults/${searchTerm}`)
      window.location.reload()}} class="d-flex"> 
      <input onChange={(e) => setSearchTerm(e.target.value)} type='text' placeholder='Search...'/> 
      <button class="btn btn-outline-primary" type='submit'>🔍</button> 
    </form>

  </div>
</nav>
    )
}

export default NavigationComponent;

