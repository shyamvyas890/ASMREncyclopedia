import React, { useRef, useState } from "react";
import axios from "axios";
const AddVideoPostComponent = (props)=>{
    const hostname= "http://localhost:3001";
    const [videoTags, setVideoTags]= useState([]);
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
        const addPost = await axios.post(`http://localhost:3001/video/${theId}`, {
            UserId: props.userIdOfCurrentUser,
            Title:theTitle    
        })
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
        <form onSubmit={handleSubmit}>
            <style>
                {`
                   .tag {
                    display: inline-block;
                    background-color: yellow;
                    color: black; 
                    padding: 5px;
                    margin: 5px;
                    border-radius: 5px;
                  }
                  
                  .tag-container {
                    display: inline-block;
                    padding: 5px;
                    margin-top: 5px;
                    border-radius: 5px;
                  }
                `}
            </style>
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
            <label> Enter the genres for this ASMR Video, separated by commas (or press enter to add a genre)
                <br/>
            <input className="tag-container" contentEditable ref={tagRef} onKeyDown={handleOnKeyDown} />
            </label>
            <br />
            {videoTags.map((tag, index)=>(
                    <div key={index} className="tag">
                        {tag}
                        <button onClick={(e)=>{handleRemovalOfTag(e,tag)}}>&times;</button>
                    </div>
                ))}
            <button type="submit">Submit Video Post</button>
        </form>
    )

}

export default AddVideoPostComponent;