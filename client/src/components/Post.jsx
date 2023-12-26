import React, { useState } from 'react';

const PostComponent = (props) =>{
    

    const handleLike = async () => {


    }

    const handleDislike= async ()=>{

    }

    return (
        <div>
            <h5>{props.username}</h5>
            <h6>{props.title}</h6>
            <iframe width="420" height="315" title= "Title" allow="fullscreen;"
                src={`https://www.youtube.com/embed/${props.id}`}>
            </iframe>
            <button onClick={handleLike}>Like </button>
            <button onClick={handleDislike}>Dislike</button>
        </div>
    );
}

export default PostComponent;