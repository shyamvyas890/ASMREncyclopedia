import React, {useState} from "react";
import axios from '../utils/AxiosWithCredentials';
import { useNavigate } from "react-router-dom";

const FriendsComponent = (props)=>{
    const hostname= "http://localhost:3001";
    const [username, setUsername] = useState("");
    const [isLoggedIn, setIsLoggedIn]= useState(false);
    const [incomingOutgoingFriendRequestsAndFriendships, setIncomingOutgoingFriendRequestsAndFriendships]= useState(null)
    const navigate=useNavigate();
    const tokenVerify= async (e) => {
        const theToken= localStorage.getItem("token");
        if(theToken){
            try{
                const response= await axios.get(`http://localhost:3001/verify-token/${theToken}`)
                if(response.data.username){
                    setUsername(response.data.username)
                    setIsLoggedIn(true);
                }
                else {
                    // setIsLoggedIn(false);
                    navigate("/");
            
                }
            }
    
            catch(error){
                console.log(error);
            }
        }
        else{
            // setIsLoggedIn(false);
            navigate("/");
            
        }
    }
    
    React.useEffect(()=>{
        tokenVerify();
    },[]);
    const populateFriends = async ()=>{
        if(username!==""){
            const id = (await axios.get(`${hostname}/users/id`, {params:{username}})).data.id;
            const incomingFriendRequests = (await axios.get(`${hostname}/IncomingFriendRequests/${id}`)).data;
            for(let i=0;i<incomingFriendRequests.length;i++){
                incomingFriendRequests[i].SenderUsername= (await axios.get(`${hostname}/users/id?UserId=${incomingFriendRequests[i].SenderUserId}`)).data.username;
            }
            console.log(incomingFriendRequests);
            const outgoingFriendRequests = (await axios.get(`${hostname}/OutgoingFriendRequests/${id}`)).data
            for(let i=0;i<outgoingFriendRequests.length;i++){
                outgoingFriendRequests[i].ReceiverUsername= (await axios.get(`${hostname}/users/id?UserId=${outgoingFriendRequests[i].ReceiverUserId}`)).data.username;
            }
            console.log(outgoingFriendRequests)
            const friendships = (await axios.get(`${hostname}/ListOfFriends/${id}`)).data
            for(let i=0;i<friendships.length;i++){
                let theUserId;
                if(friendships[i].UserId1===id){
                    theUserId=friendships[i].UserId2
                }
                else{
                    theUserId=friendships[i].UserId2
                }
                friendships[i].friendUsername= (await axios.get(`${hostname}/users/id?UserId=${theUserId}`)).data.username;
            }
            console.log(friendships)
            setIncomingOutgoingFriendRequestsAndFriendships({incomingFriendRequests, outgoingFriendRequests, friendships, userIdOfCurrentUser:id})            
        }
    }
    React.useEffect(()=>{
        populateFriends();
    }, [username])



    const acceptFriendRequest = async (e, SenderUserId) =>{
        e.preventDefault();
        const deleteFriendRequest = await axios.delete(`${hostname}/friendRequests`, {params:{SenderUserId, ReceiverUserId:incomingOutgoingFriendRequestsAndFriendships.userIdOfCurrentUser}});
        console.log(deleteFriendRequest);
        const addFriendship = await axios.post(`${hostname}/Friendships`, {UserId1:SenderUserId, UserId2:incomingOutgoingFriendRequestsAndFriendships.userIdOfCurrentUser});
        console.log(addFriendship);
        populateFriends();

    }
    const declineFriendRequest = async (e, SenderUserId) => {
        e.preventDefault();
        const deleteFriendRequest = await axios.delete(`${hostname}/friendRequests`, {params:{SenderUserId, ReceiverUserId:incomingOutgoingFriendRequestsAndFriendships.userIdOfCurrentUser}});
        console.log(deleteFriendRequest);
        populateFriends();
    }
    const unfriend= async (e, FriendUserId) =>{
        e.preventDefault();
        const deleteFriendship = await axios.delete(`${hostname}/Friendships`, {params: {UserId1:FriendUserId, UserId2:incomingOutgoingFriendRequestsAndFriendships.userIdOfCurrentUser}})
        console.log(deleteFriendship);
        populateFriends();
    }
    const cancelFriendRequest = async (e, ReceiverUserId) =>{
        e.preventDefault();
        const deleteFriendRequest = await axios.delete(`${hostname}/friendRequests`, {params:{ReceiverUserId, SenderUserId:incomingOutgoingFriendRequestsAndFriendships.userIdOfCurrentUser}});
        console.log(deleteFriendRequest);
        populateFriends();
    }
    return (isLoggedIn && username && incomingOutgoingFriendRequestsAndFriendships? <React.Fragment>
            <div>Incoming Friend Requests</div>
            {incomingOutgoingFriendRequestsAndFriendships.incomingFriendRequests.map((request, index)=>(
                <React.Fragment key={index}>
                    <div>{request.SenderUsername}</div>
                    <button onClick={(e)=>{acceptFriendRequest(e,request.SenderUserId)}}>✅</button>
                    <button onClick={(e)=>{declineFriendRequest(e,request.SenderUserId)}}>❌</button>
                </React.Fragment>
            ))}
            <div>Outgoing Friend Requests</div>
            {incomingOutgoingFriendRequestsAndFriendships.outgoingFriendRequests.map((request,index)=>(
                <React.Fragment key={index}>
                    <div>{request.ReceiverUsername}</div>
                    <button onClick={(e)=>{cancelFriendRequest(e, request.ReceiverUserId)}}>Cancel Request</button>
                </React.Fragment>
            ))}
            <div>Friends</div>
            {incomingOutgoingFriendRequestsAndFriendships.friendships.map((friend, index)=>(
                <React.Fragment key={index}>
                    <div>{friend.friendUsername}</div>
                    <button onClick={(e)=>{unfriend(e, friend.UserId1===incomingOutgoingFriendRequestsAndFriendships.userIdOfCurrentUser? friend.UserId2:friend.UserId1)}}>Unfriend</button>
                </React.Fragment>
            ))}
            
            </React.Fragment>:null)

}

export default FriendsComponent;