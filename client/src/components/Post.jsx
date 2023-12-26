import React, { useState } from 'react';

const PostComponent = (props) =>{
    function getYouTubeVideoId(url) {
        try {
          const youtubeUrl = new URL(url);
          if ((youtubeUrl.hostname === 'www.youtube.com' || youtubeUrl.hostname === 'youtu.be') && youtubeUrl.searchParams.has('v')) {
            return youtubeUrl.searchParams.get('v');
          }
        } catch (error) {
          console.error('Error extracting YouTube video ID:', error);
        }
        return null;
    }

    return (
        <div>
            <h5>{props.username}</h5>
            <h6>{props.title}</h6>
            <iframe width="420" height="315"
                src={`https://www.youtube.com/embed/${getYouTubeVideoId(props.link)}`}>
            </iframe>
            <button>Like </button>
            <button>Dislike</button>
        </div>
    );
}

export default PostComponent;