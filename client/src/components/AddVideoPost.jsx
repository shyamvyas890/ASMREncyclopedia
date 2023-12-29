import React, { useRef } from "react";
import axios from "axios";
const AddVideoPostComponent = (props)=>{

    const titleRef= useRef(null);
    const linkRef= useRef(null);
    function getYouTubeVideoId(url) {
        try {
          const modifiedUrl= url.startsWith("https://")? url:`https://${url}`
          const youtubeUrl = new URL(modifiedUrl);
          if ((youtubeUrl.hostname === 'www.youtube.com' || youtubeUrl.hostname === 'youtu.be' || youtubeUrl.hostname ==='youtube.com') && (youtubeUrl.searchParams.has('v') || youtubeUrl.pathname.length>0)) {
            if(youtubeUrl.searchParams.has("v")){
                return youtubeUrl.searchParams.get('v');
            }
            const pathname = youtubeUrl.pathname.split('/');
            console.log(pathname)
            return pathname[pathname.length-1];
          }
        } catch (error) {
          console.error('Error extracting YouTube video ID:', error);
        }
        return null;
    }
    const handleSubmit = async (e) =>{
        e.preventDefault();
        const theTitle= titleRef.current.value;
        const theLink= linkRef.current.value;
        console.log(theTitle)
        console.log(theLink)
        const theId= getYouTubeVideoId(theLink);
        if(!theId){
            console.log("Something is wrong with the link you gave");
            return;
        }
        const addPost = await axios.post(`http://localhost:3001/video/${theId}`, {
            UserId: props.userIdOfCurrentUser,
            Title:theTitle    
        })
        console.log(addPost);
        titleRef.current.value="";
        linkRef.current.value="";
        props.fetchVideoPosts();

    }
    return (
        <form onSubmit={handleSubmit}>
            <label>
            Title:
            <input ref={titleRef} type="text"  />
            </label>
            <br />
            <label>
            Youtube Video Link:
            <input ref={linkRef} type="text"/>
            </label>
            <br />
            <button type="submit">Submit Video Post</button>
        </form>
    )

}

export default AddVideoPostComponent;