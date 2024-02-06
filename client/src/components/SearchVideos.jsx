import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { axiosRequest, hostname } from "../utils/utils";
import PostComponent from "./Post";
const SearchVideosComponent = ()=>{
    const [keyword, setKeyword] = React.useState(useParams().keyword);
    const [username, setUsername] = useState(null);
    const [userIdOfCurrentUser, setUserIdOfCurrentUser]= useState(null);
    const [videoPostsAndRatings, setVideoPostsAndRatings] = useState(null);
    const navigate = useNavigate();
    const handleSearchButton = (e)=>{
        e.preventDefault();
        setKeyword(e.target.elements.inputElement.value);

    }
    const tokenVerify = async (e) =>{
        const theToken= localStorage.getItem("token");
        if(theToken){
            try{
                const response= await axios.get(`http://localhost:3001/verify-token/${theToken}`)
                if(response.data.username){
                    const userIdOfCurrentUser = (await axios.get(`${hostname}/users/id`, {params:{username:response.data.username}})).data.id;
                    setUsername(response.data.username);
                    setUserIdOfCurrentUser(userIdOfCurrentUser);
                }
                else {
                    navigate("/");
                }
            }
    
            catch(error){
                console.log(error);
            }
        }
        else{
            navigate("/");
        }

    }

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
            const thePostsData= theUnfilteredPostsData;
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
    React.useEffect(()=>{
        tokenVerify();
    },[]);

    React.useEffect(()=>{
        if(username && userIdOfCurrentUser){
            fetchVideoPosts();
        }

    },[username,userIdOfCurrentUser]);

    
    return (
        username && userIdOfCurrentUser && videoPostsAndRatings && <>
            <form onSubmit={handleSearchButton}>
                <input type='text' placeholder='Search videos...' name="inputElement" defaultValue={keyword}/>
                <button type="submit">🔍</button>
            </form>
            {videoPostsAndRatings.filter(post=>post.Title.toLowerCase().includes(keyword.toLowerCase())).map((post, index)=>(
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
    );

}
export default SearchVideosComponent;
