import React from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
const ProfilePageComponent = ()=>{
    const hostname= "http://localhost:3001";
    const [username, setUsername]= React.useState(null);
    const [profileUsername, setProfileUsername]= React.useState(null);
    const [friendStatus, setFriendStatus]= React.useState(null);
    const theirUsername= useParams().ProfileUsername;
    const navigate= useNavigate();
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

    const tokenVerify= async (e) => {
        const theToken= localStorage.getItem("token");
        if(theToken){
            try{
                const response= await axios.get(`http://localhost:3001/verify-token/${theToken}`)
                if(response.data.username){
                    const userIdOfCurrentUser = (await axios.get(`${hostname}/users/id`, {params:{username:response.data.username}})).data.id;
                    const userIdOfProfileUser = (await axios.get(`${hostname}/users/id`, {params:{username:theirUsername}}));
                    setUsername({userIdOfCurrentUser, username:response.data.username});
                    setProfileUsername({userIdOfProfileUser:userIdOfProfileUser.data.id, username:theirUsername})               
                }
                else {
                    navigate("/");
                }
            }
    
            catch(error){
                console.log(error);
                navigate("/")
            }
        }
        else{
            navigate("/");
        }
    }

    React.useEffect(()=>{
        tokenVerify();
    }, []);
    const friendFunction = async ()=>{
        if(username.userIdOfCurrentUser===profileUsername.userIdOfProfileUser){
            setFriendStatus(4);
            return;
        }
        const friendshipInformation= await axiosRequest(3,2,"FriendRelationship", {LoggedInUserId: username.userIdOfCurrentUser, VisitorUserId:profileUsername.userIdOfProfileUser});
        if(friendshipInformation.data.length===0){
            setFriendStatus(0);
        }
        else if(friendshipInformation.data[0].UserId1!==undefined){
            setFriendStatus(1);
        }
        else {
            if(friendshipInformation.data[0].SenderUserId === username.userIdOfCurrentUser){
                setFriendStatus(2)
            }
            else if (friendshipInformation.data[0].ReceiverUserId === username.userIdOfCurrentUser) {
                setFriendStatus(3)

            }
        }
    }
    React.useEffect(()=>{
        if(username && profileUsername){
            friendFunction();
        }
    }, [username, profileUsername])

    const handleAddFriend = async (e)=>{
        e.preventDefault();
        await axiosRequest(1,1,"friendRequests", {SenderUserId:username.userIdOfCurrentUser, ReceiverUserId:profileUsername.userIdOfProfileUser});
        setFriendStatus(2);

    }
    const handleUnfriend = async (e)=>{
        e.preventDefault();
        await axiosRequest(2,2,"Friendships", {UserId1:username.userIdOfCurrentUser, UserId2: profileUsername.userIdOfProfileUser});
        setFriendStatus(0);
        
    }
    const handleCancelFriendRequest = async (e)=>{
        e.preventDefault();
        await axiosRequest(2,2,"friendRequests", {SenderUserId:username.userIdOfCurrentUser, ReceiverUserId:profileUsername.userIdOfProfileUser});
        setFriendStatus(0);
    }
    const handleAcceptFriendRequest = async (e)=>{
        e.preventDefault();
        await axiosRequest(2,2,"friendRequests", {SenderUserId:profileUsername.userIdOfProfileUser, ReceiverUserId:username.userIdOfCurrentUser});
        await axiosRequest(1,1,"Friendships", {UserId1:username.userIdOfCurrentUser, UserId2: profileUsername.userIdOfProfileUser});
        setFriendStatus(1);
    }
    const handleDeclineFriendRequest = async (e)=>{
        e.preventDefault();
        await axiosRequest(2,2,"friendRequests", {SenderUserId:profileUsername.userIdOfProfileUser, ReceiverUserId:username.userIdOfCurrentUser});
        setFriendStatus(0);        
    }
    


    return (
        
            username!==null && profileUsername!==null && <>
            <div>{theirUsername}</div>
            {friendStatus!==null && friendStatus!==4 && <>
                {friendStatus===0? <button onClick={handleAddFriend}>Add Friend</button> : 
                friendStatus===1? <button onClick={handleUnfriend}>Unfriend</button> : 
                friendStatus===2? <button onClick={handleCancelFriendRequest}>Cancel Friend Request</button>: 
                <div>
                    <button onClick={handleAcceptFriendRequest}>✅</button>
                    <button onClick={handleDeclineFriendRequest}>❌</button>
                </div>
                }
            </>}
            
            
            </> 
        

    )

}

export default ProfilePageComponent;
