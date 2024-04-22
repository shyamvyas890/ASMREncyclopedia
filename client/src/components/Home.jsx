import React, { useState } from 'react';
import LoginComponent from './Login';
import PostComponent from './Post';
import axios from '../utils/AxiosWithCredentials';
import AddVideoPostComponent from './AddVideoPost';
import {axiosRequest} from "../utils/utils.js";
import { useNavigate } from 'react-router-dom';
import NavigationComponent from './Navigation.jsx';
import HomeCSS from "../css/home.module.css"
import NotificationsComponent from './Notifications.jsx';

const HomeComponent= () => {
    const [username, setUsername] = useState('');
    const [userIdOfCurrentUser, setUserIdOfCurrentUser]= useState(null);
    const [isLoggedIn, setIsLoggedIn]= useState(null);
    const [videoPostsAndRatings, setVideoPostsAndRatings] = useState(null);
    const [sortOption, setSortOption]= useState("latest");
    const [sortedVideos, setSortedVideos]= useState(null);
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
                const rating= await axios.get("http://localhost:3001/video-rating", 
                {
                    params:{ VideoPostId:thePostsData[i].VideoPostId }
                }
                );
                for(let j=0; j<rating.data.length; j=j+1){
                    if(rating.data[j].UserId===tempHolderOfUserIdOfCurrentUser){
                        if(rating.data[j].LikeStatus===1){
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
                let totalLikes=0;
                let totalDislikes=0;
                for(const theRating of rating.data){
                    if(theRating.LikeStatus===0){
                        totalDislikes++;
                    }
                    else if(theRating.LikeStatus===1){
                        totalLikes++;
                    }
                }
                thePostsData[i].totalLikes=totalLikes;
                thePostsData[i].totalDislikes=totalDislikes;
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
    }, [isLoggedIn]);
    React.useEffect(()=>{
        if(videoPostsAndRatings!==null){
            handleSort({
                target:{
                    value:sortOption
                }
            });
        }
    },[videoPostsAndRatings]);

    const handleSearchButton = (e)=>{
        e.preventDefault();
        navigate(`/search/videos/${e.target.elements.inputElement.value}`);
    }

    const handleSort = (e)=>{
        let newVideosArray = [...videoPostsAndRatings];
        if(e.target.value==="latest"){
            newVideosArray.sort((a,b)=>{
                const dateA= new Date(a.PostedAt);
                const dateB = new Date(b.PostedAt);
                if(dateA.getTime()>dateB.getTime()){
                    return -1;
                }
                else if(dateA.getTime()<dateB.getTime()){
                    return 1;
                }
                return 0;
            })
        }
        else if (e.target.value==="oldest"){
            newVideosArray.sort((a,b)=>{
                const dateA= new Date(a.PostedAt);
                const dateB = new Date(b.PostedAt);
                if(dateA.getTime()>dateB.getTime()){
                    return 1;
                }
                else if(dateA.getTime()<dateB.getTime()){
                    return -1;
                }
                return 0;
            })
        }
        else if(e.target.value==="best"){
            newVideosArray.sort((a,b)=>{
                const AScore = a.totalLikes-a.totalDislikes;
                const BScore = b.totalLikes-b.totalDislikes;
                if(AScore>BScore){
                    return -1;
                }
                else if (BScore>AScore){
                    return 1;
                }
                return 0;
            })
        }
        else if (e.target.value==="worst"){
            newVideosArray.sort((a,b)=>{
                const AScore = a.totalLikes-a.totalDislikes;
                const BScore = b.totalLikes-b.totalDislikes;
                if(AScore>BScore){
                    return 1;
                }
                else if (BScore>AScore){
                    return -1;
                }
                return 0;
            })
        }
        const theSortOption = e.target.value;
        setSortOption(theSortOption);
        setSortedVideos(newVideosArray);
    }
    return (
        <div>
            <LoginComponent 
            username= {username}
            setUsername= {setUsername}
            isLoggedIn={isLoggedIn}
            setIsLoggedIn={setIsLoggedIn}
            />

            {(isLoggedIn && videoPostsAndRatings && sortedVideos && userIdOfCurrentUser) ? (                
                    <>
                   <div>
                        <NavigationComponent />
                        <div className={HomeCSS['container']}>
                          <div>
                           <AddVideoPostComponent 
                           userIdOfCurrentUser={userIdOfCurrentUser}
                           fetchVideoPosts={fetchVideoPosts}    
                           />
                          </div>
                        </div> 


                        <form className={HomeCSS['video-post-sort-form']}>
                          <select className={HomeCSS['video-post-sort-form-select']} value={sortOption} onChange={handleSort}>
                            <option value="none"> Sort by...</option>
                            <option value="latest"> Newest to Oldest (default) </option>
                            <option value="oldest"> Oldest to Newest </option>
                            <option value="best"> Most Liked to Least Liked </option>
                            <option value="worst"> Least Liked to Most Liked </option>
                          </select>
                        </form>
                       
                    </div>

                    <div className={HomeCSS['feed-posts']}>
                      {sortedVideos.map((post, index)=>(
                        <div key={index+sortedVideos.length} >
                            <PostComponent 
                                key={index}
                                index={videoPostsAndRatings.indexOf(post)} 
                                username={post.username} 
                                title={post.Title} 
                                userIdOfCurrentUser= {userIdOfCurrentUser}
                                usernameOfCurrentUser= {username}
                                VideoLinkId= {post.VideoLinkId}
                                VideoPostId= {post.VideoPostId}
                                rating= {sortedVideos[index].feedback}
                                setVideoPostsAndRatings= {setVideoPostsAndRatings}
                                timestamp={post.PostedAt}
                                totalLikes={sortedVideos[index].totalLikes}
                                totalDislikes={sortedVideos[index].totalDislikes}
                            />    
                        </div>
                      ))}
                    </div>
                        

                    


                    
                  
                </>
            ):null}
        </div>
    )
}
export default HomeComponent;

