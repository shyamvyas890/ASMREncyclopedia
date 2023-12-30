import React, { useState } from 'react';
import LoginComponent from './Login';
import PostComponent from './Post';
import axios from 'axios';
import { ForumPostComponent } from './ForumPost';

const HomeComponent= () => {
    const [username, setUsername] = useState('');
    const [userIdOfCurrentUser, setUserIdOfCurrentUser]= useState(null);
    const [isLoggedIn, setIsLoggedIn]= useState(false);
    const [videoPosts, setVideoPosts]= useState(null);
    const [userRatings, setUserRatings]= useState(null);
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

    React.useEffect( () =>{
        const fetchVideoPosts = async ()=>{
            try {
                const thePosts = await axios.get("http://localhost:3001/video");
                const thePostsData= thePosts.data;
                for(let i=0;i<thePostsData.length;i++){
                    try{
                        const username= await axios.get("http://localhost:3001/users/id", 
                        {
                            params:{ UserId:thePostsData[i].UserId }
                        }
                        );
                        thePostsData[i].username=username.data.username;
                    }
                    catch(err){
                        console.log(err);
                    }
                }
                 
                let feedback=[];
                let tempHolderOfUserIdOfCurrentUser;
                try{
                    const theId= await axios.get("http://localhost:3001/users/id", 
                        {
                            params:{ username }
                        }
                    );
                    tempHolderOfUserIdOfCurrentUser=theId.data.id
                    setUserIdOfCurrentUser(theId.data.id);
                }
                catch(err){
                    console.log(err);
                }
                for(let i=0;i<thePostsData.length;i++){
                    try{
                        const rating= await axios.get("http://localhost:3001/video-rating", 
                        {
                            params:{ VideoPostId:thePostsData[i].VideoPostId }
                        }
                        );
                        for(let j=0; j<rating.data.length; j=j+1){
                            if(rating.data[j].UserId===tempHolderOfUserIdOfCurrentUser){
                                if(rating.data[j].LikeStatus){
                                    feedback.push(1);
                                }
                                else {
                                    feedback.push(-1);
                                }
                                break;
                            }
                            else if(j===rating.data.length - 1){
                                feedback.push(0);
                            }
                        }
                        if(rating.data.length===0){
                            feedback.push(0);
                        }    
                    }
                    catch(err){
                        console.log(err)
                    }
                }
                setVideoPosts(thePostsData);
                setUserRatings(feedback);

            }
            catch(err){
                console.log(err);
            }
        }
        if(isLoggedIn){
            fetchVideoPosts();
        }
    }, [isLoggedIn])

    
    return (
        <div>
            <LoginComponent 
            username= {username}
            setUsername= {setUsername}
            isLoggedIn={isLoggedIn}
            setIsLoggedIn={setIsLoggedIn}
            />

            
            {(isLoggedIn) ?  <ForumPostComponent username={username} /> : null}

            {(isLoggedIn && videoPosts && userRatings && userIdOfCurrentUser) ? (
                videoPosts.map((post, index)=>{
                    return <PostComponent 
                                key={index}
                                index={index} 
                                username={post.username} 
                                title={post.Title} 
                                userIdOfCurrentUser= {userIdOfCurrentUser}
                                VideoLinkId= {post.VideoLinkId}
                                VideoPostId= {post.VideoPostId}
                                rating= {userRatings[index]}
                                setUserRatings={setUserRatings}
                            />
                            }
                        )
                        ):null }
            
            
        </div>
    )
}
export default HomeComponent;

