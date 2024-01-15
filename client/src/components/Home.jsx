import React, { useState } from 'react';
import LoginComponent from './Login';
import PostComponent from './Post';
import axios from 'axios';
import AddVideoPostComponent from './AddVideoPost';
const HomeComponent= () => {
    const [username, setUsername] = useState('');
    const [userIdOfCurrentUser, setUserIdOfCurrentUser]= useState(null);
    const [isLoggedIn, setIsLoggedIn]= useState(false);
    const [videoPostsAndRatings, setVideoPostsAndRatings] = useState(null);
    const [filteredVideoPostsAndRatings, setFilteredVideoPostsAndRatings]= useState(null);
    const hostname= "http://localhost:3001"
    const axiosRequest = async (reqNum, inputType, pathname, theInput )=>{ // reqNum = POST =1 DELETE = 2 GET = 3 PUT = 4   inputType = Body= 1 Query = 2 (doesnt cover params input)     
        let response;
        if(reqNum===1){
            if(inputType === 1){
                response = await axios.post(`${hostname}/${pathname}`, theInput);
            }
            else if (inputType === 2){
                response = await axios.post(`${hostname}/${pathname}`, {params:theInput})
            }
        }
        else if(reqNum===2){
            if (inputType === 2){
                response= await axios.delete(`${hostname}/${pathname}`, {params:theInput})
            }
        }
        else if(reqNum===3){
            if (inputType === 2){
                response= await axios.get(`${hostname}/${pathname}`, {params:theInput})
            }
        }
        else if(reqNum===4){
            if(inputType === 1){
                response = await axios.put(`${hostname}/${pathname}`, theInput)
            }
        }
        return response;
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
            console.log(theUnfilteredPostsData);
            const filters= {};
            filters.only = (await axiosRequest(3,2,"videoSubscriptionOnly", {UserId:tempHolderOfUserIdOfCurrentUser})).data
            filters.subscriptions= (await axiosRequest(3,2, "videoSubscriptions", {UserId:tempHolderOfUserIdOfCurrentUser})).data.map(subInfo=>subInfo.GenreId);
            console.log(filters);

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
            setFilteredVideoPostsAndRatings(thePostsData);

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
    const handleSearch = async(e)=>{
        console.log(e.target.value)
        setFilteredVideoPostsAndRatings(videoPostsAndRatings.filter(post=>(post.Title.toLowerCase().includes(e.target.value.toLowerCase()))))

    }
    return (
        <div>
            <LoginComponent 
            username= {username}
            setUsername= {setUsername}
            isLoggedIn={isLoggedIn}
            setIsLoggedIn={setIsLoggedIn}
            />
            {(isLoggedIn && filteredVideoPostsAndRatings && userIdOfCurrentUser) ? (
                <>
                    
                    <h3>Add a new Video!</h3>
                    <AddVideoPostComponent 
                    userIdOfCurrentUser={userIdOfCurrentUser}
                    fetchVideoPosts={fetchVideoPosts}    
                    />
                    <input type="text" placeholder="Search" onChange={handleSearch} />
                    {filteredVideoPostsAndRatings.map((post, index)=>(
                        <div key={index+filteredVideoPostsAndRatings.length} >
                            <PostComponent 
                                key={index}
                                index={index} 
                                username={post.username} 
                                title={post.Title} 
                                userIdOfCurrentUser= {userIdOfCurrentUser}
                                usernameOfCurrentUser= {username}
                                VideoLinkId= {post.VideoLinkId}
                                VideoPostId= {post.VideoPostId}
                                rating= {filteredVideoPostsAndRatings[index].feedback}
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

