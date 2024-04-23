import React, { useRef, useState } from "react";
import axios from '../utils/AxiosWithCredentials';
import 'bootstrap/dist/css/bootstrap.min.css';
import AddVideoPostCSS from"../css/addvideopost.module.css"

const AddVideoPostComponent = (props)=>{
    const hostname= "http://localhost:3001";
    const [videoTags, setVideoTags]= useState([]);
    const [errorMessage, setErrorMessage] = React.useState("");
    const titleRef= useRef(null);
    const linkRef= useRef(null);
    const tagRef= useRef(null);
    function getYouTubeVideoId(url) {
        try {
          const modifiedUrl= url.startsWith("https://")? url:`https://${url}`
          const youtubeUrl = new URL(modifiedUrl);
          if ((youtubeUrl.hostname === 'www.youtube.com' || youtubeUrl.hostname === 'youtu.be' || youtubeUrl.hostname ==='youtube.com') && (youtubeUrl.searchParams.has('v') || youtubeUrl.pathname.length>0)) {
            if(youtubeUrl.searchParams.has("v")){
                return youtubeUrl.searchParams.get('v');
            }
            const pathname = youtubeUrl.pathname.split('/');
            return pathname[pathname.length-1];
          }
        } catch (error) {
          console.error('Error extracting YouTube video ID:', error);
        }
        return null;
    }

    const handleOnKeyDown = (e)=>{
        if(e.key==="Enter" || e.key===","){
            e.preventDefault();
            addTag(tagRef.current.value.trim())
            tagRef.current.value='';
        }
    }

    const handleRemovalOfTag = (e, removeThis)=>{
        e.preventDefault();
        setVideoTags(prevTags=>prevTags.filter(theTag=> theTag!==removeThis));
    }

    const addTag = (newTag)=>{
        if(newTag && !videoTags.includes(newTag)){
            setVideoTags(prevTags=>[...prevTags, newTag]);
        }
    }

    const handleSubmit = async (e) =>{
        e.preventDefault();
        const theTitle= titleRef.current.value;
        const theLink= linkRef.current.value;
        const theId= getYouTubeVideoId(theLink);
        if(!theId){
            console.log("Something is wrong with the link you gave");
            return;
        }
        if(videoTags.length===0){
            console.log("You must have at least one tag");
            return;
        }
        let addPost;
        try{
            addPost = await axios.post(`http://localhost:3001/video/${theId}`, {
                UserId: props.userIdOfCurrentUser,
                Title:theTitle    
            })
        }
        catch(error){


            setErrorMessage(error.response.data)
            titleRef.current.value="";
            linkRef.current.value="";
            tagRef.current.value="";
            setVideoTags([]);
            return;
        }
            
        for(const videoTag of videoTags){
            const addTag= await axios.post(`${hostname}/video-genre`, {
                VideoPostId: addPost.data.insertId, Genre:videoTag
            });
        }
        titleRef.current.value="";
        linkRef.current.value="";
        tagRef.current.value="";
        props.fetchVideoPosts();
        setVideoTags([]);
    }
    return (
      <div>
        <form onSubmit={handleSubmit}>
          
            <input className={AddVideoPostCSS['video-title']}    ref={titleRef} type="text" placeholder="Title" />
          
            <br />
         
            <input className={AddVideoPostCSS['video-link']} ref={linkRef} type="text" placeholder="Link to Video"/>
            
            <br />
            
                
            <input className={AddVideoPostCSS['video-post-add-tag']} ref={tagRef} onKeyDown={handleOnKeyDown} placeholder="Press 'Enter' to add tag(s)" />
            
            <br />
            {videoTags.map((tag, index)=>(
                    <div key={index}>
                        {tag}
                        <button className={AddVideoPostCSS['tag-button']} onClick={(e)=>{handleRemovalOfTag(e,tag)}}> x </button>
                    </div>
                ))}
            <div style={{color:"red"}}>{errorMessage}</div>
            <button  type="submit" className="btn btn-primary"> Post </button>
        </form>
    </div>
    )

}

export default AddVideoPostComponent;