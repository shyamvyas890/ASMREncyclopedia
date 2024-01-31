import React, { useState } from 'react';
import LoginComponent from './Login';
import PostComponent from './Post';
import axios from 'axios';
import AddVideoPostComponent from './AddVideoPost';
import {axiosRequest} from "../utils/utils.js";
import { useNavigate } from 'react-router-dom';
const HomeComponent= () => {
    const [username, setUsername] = useState('');
    const [userIdOfCurrentUser, setUserIdOfCurrentUser]= useState(null);
    const [isLoggedIn, setIsLoggedIn]= useState(false);
    const [videoPostsAndRatings, setVideoPostsAndRatings] = useState(null);
    const navigate = useNavigate();
    const fetchVideoPosts = async ()=>{
        try {
            const thePosts = await axios.get("http://localhost:3001/video");
            const theUnfilteredPostsData= thePosts.data;
            for(let i=0;i<theUnfilteredPostsData.length;i++){
                try{
                    const username= await axios.get("http://localhost:3001/users/id", 
                    {
                        params:{ UserId:theUnfilteredPostsData[i].UserId }
                    }
                    );
                    theUnfilteredPostsData[i].username=username.data.username;
                }
                catch(err){
                    console.log(err);
                }
            }
             
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

            
            for(const vid of theUnfilteredPostsData){
                vid.genreIds= (await axiosRequest(3,2,"video-by-genre-or-user", {VideoPostId:vid.VideoPostId})).data.map(genreInfo=>genreInfo.GenreId);
            }
            const filters= {};
            filters.only = (await axiosRequest(3,2,"videoSubscriptionOnly", {UserId:tempHolderOfUserIdOfCurrentUser})).data
            filters.subscriptions= (await axiosRequest(3,2, "videoSubscriptions", {UserId:tempHolderOfUserIdOfCurrentUser})).data.map(subInfo=>subInfo.GenreId);
            

            let thePostsData=[];
            if(filters.only.length===0){
                thePostsData=theUnfilteredPostsData;
            }
            else {
                if(filters.only[0].Only===1){
                    for(const vid of theUnfilteredPostsData){
                        for(const genreId of vid.genreIds){
                            if(filters.subscriptions.includes(genreId)){
                                thePostsData.push(vid);
                                break;
                            }
                        }
                    }
                }
                else if(filters.only[0].Only===0){
                    thePostsData= theUnfilteredPostsData.filter((thePost)=>{
                        for(const theGenreId of thePost.genreIds){
                            if(filters.subscriptions.includes(theGenreId)){
                                return false;
                            }
                        }
                        return true;
                    })
                }
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
                                thePostsData[i].feedback=1
                            }
                            else {
                                thePostsData[i].feedback=-1
                            }
                            break;
                        }
                        else if(j===rating.data.length - 1){
                            thePostsData[i].feedback=0;
                        }
                    }
                    if(rating.data.length===0){
                        thePostsData[i].feedback=0;
                    }    
                }
                catch(err){
                    console.log(err)
                }
            }
            setVideoPostsAndRatings(thePostsData);
        }
        catch(err){
            console.log(err);
        }
    }
    React.useEffect( () =>{ 
        if(isLoggedIn){
            fetchVideoPosts();
        }
    }, [isLoggedIn])
    const handleSearchButton = (e)=>{
        e.preventDefault();
        navigate(`/search/videos/${e.target.elements.inputElement.value}`);
    }
    return (
        <div>
            <LoginComponent 
            username= {username}
            setUsername= {setUsername}
            isLoggedIn={isLoggedIn}
            setIsLoggedIn={setIsLoggedIn}
            />
            {(isLoggedIn && videoPostsAndRatings && userIdOfCurrentUser) ? (
                <>
                    <h3>Add a new Video!</h3>
                    <AddVideoPostComponent 
                    userIdOfCurrentUser={userIdOfCurrentUser}
                    fetchVideoPosts={fetchVideoPosts}    
                    />
                    <form onSubmit={handleSearchButton}>    
                        <input type='text' placeholder='Search videos...' name='inputElement' />
                        <button type='submit'>🔍</button>
                    </form>
                    {videoPostsAndRatings.map((post, index)=>(
                        <div key={index+videoPostsAndRatings.length} >
                            <PostComponent 
                                key={index}
                                index={index} 
                                username={post.username} 
                                title={post.Title} 
                                userIdOfCurrentUser= {userIdOfCurrentUser}
                                usernameOfCurrentUser= {username}
                                VideoLinkId= {post.VideoLinkId}
                                VideoPostId= {post.VideoPostId}
                                rating= {videoPostsAndRatings[index].feedback}
                                setVideoPostsAndRatings= {setVideoPostsAndRatings}
                            />
                        </div>
                    ))}
                </>
            ):null}
        </div>
    )
}
export default HomeComponent;

