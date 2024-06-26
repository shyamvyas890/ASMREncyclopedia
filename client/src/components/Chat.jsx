import React, { useEffect, useState } from "react";
import axios from '../utils/AxiosWithCredentials';
import io from 'socket.io-client';
import { useNavigate } from "react-router-dom";
import { axiosRequest, hostname } from '../utils/utils';
import NavigationComponent from "./Navigation";
import ChatCSS from "../css/chat.module.css"

const ChatComponent =()=>{
    const [username, setUsername]= useState(null);
    const [socket,setSocket]= useState(null);
    const [friends, setFriends] = useState(null);
    const [selectedChat, setSelectedChat] = useState(null);
    const navigate= useNavigate();

    const disconnectSocket = () => {
        console.log(`socket is ${socket}`)
        if (socket) {
            socket.disconnect();
        }
    };

    const tokenVerify= async () => {
            try{
                const response= await axios.get(`http://localhost:3001/verify-token`)
                const userIdOfCurrentUser = (await axios.get(`${hostname}/users/id`, {params:{username:response.data.username}})).data.id;
                setUsername({userIdOfCurrentUser, username:response.data.username})
                const friendsList = await axios.get(`${hostname}/ListOfFriends/${userIdOfCurrentUser}`);
                const theFriendsList=[];
                for(const friend of friendsList.data){
                    const friendId= friend.UserId1===userIdOfCurrentUser?friend.UserId2:friend.UserId1;
                    const friendUsername = (await axiosRequest(3,2,"users/id", {UserId:friendId})).data.username;
                    theFriendsList.push({UserId:friendId, username:friendUsername});
                }
                setFriends(theFriendsList);
                setSocket(io(hostname, { transports : ['websocket']}));
                
            }
            catch(error){
                navigate("/")
                console.log(error);
            }
    }

    React.useEffect(()=>{
        tokenVerify();
    }, []);
    const handleNewMessage = (message) => {
        console.log(message);
        console.log(selectedChat)
        if(message.SenderUserId===selectedChat.UserId){
            setSelectedChat(prev=>
                (
                    {
                        ...prev,
                        messages:[...prev.messages,
                            message
                        ]
                    }
                )
            )
        }   
    }
    const handleNewNotification = (notification)=>{
        console.log(notification);
    }
    const handleConnect = () => {
        console.log('Connected to server:', socket.id);
    };
    const handleDisconnect = () => {
        console.log('Disconnected from server');
    }

    React.useEffect( ()=>{
        if(socket){
            console.log("hey there");
            socket.on('connect', handleConnect);
            socket.on('newMessage', handleNewMessage);
            socket.on('newNotification', handleNewNotification);
            return ()=>{
                console.log("hello world")
                socket.off('newMessage', handleNewMessage);
                socket.off('newNotification', handleNewNotification);
                socket.off("connect", handleConnect);
            }
        }
    },[socket, selectedChat]
    );


    React.useEffect(()=>{
        if(socket){
            socket.on('disconnect', handleDisconnect);
            return ()=>{
                disconnectSocket();
                socket.off("disconnect", handleDisconnect);
            }
        }
        
    },[socket]);
    const handleSelectChat = async (e, theUsername)=>{
        console.log(e);
        setSelectedChat({username:theUsername, UserId: (await axiosRequest(3,2,"users/id",{username:theUsername})).data.id , messages:(await axiosRequest(3,2,"chatMessages", {UserId1: username.userIdOfCurrentUser, UserId2: (await axiosRequest(3,2,"users/id", {username:theUsername})).data.id})).data});
    }

    const handleOnKeyDown = async (e)=>{
        if(e.key==='Enter'){
            const message = e.target.value;
            const sendMessage = await axiosRequest(1,1,"chatMessage", {SenderUserId:username.userIdOfCurrentUser, ReceiverUserId: selectedChat.UserId, Message:message});
            console.log(sendMessage);
            setSelectedChat(prev=>
                (
                    {
                        ...prev,
                        messages:[...prev.messages,
                            {
                                ChatMessageId: sendMessage.data.insertId,
                                SenderUserId:username.userIdOfCurrentUser,
                                ReceiverUserId:prev.UserId, 
                                Message:message, 
                                SentAt: new Date().toISOString()
                            }
                        ]
                    }
                )
            )
            e.target.value="";
        }
    }

    return (
        <div>
            <NavigationComponent/>
            <div className={ChatCSS.container}>
                <div className={ChatCSS.friendsContainer}>
                <h2>Chat with a Friend!</h2>
                {friends && username && friends.map((friend, index) => (
                    <div 
                        className={`${ChatCSS.friends} ${selectedChat && selectedChat.UserId === friend.UserId ? ChatCSS.selectedFriend : ''}`} 
                        key={index} 
                        onClick={(e) => handleSelectChat(e, friend.username)}
                    >
                        {friend.username}
                    </div>
                ))}
                </div>
                <div className={ChatCSS.chatANDSendMessageContainer}>
                    <div className={ChatCSS.chatContainer} id="ChatContainer">
                        {selectedChat ? (selectedChat.messages.map((message, index) => (
                            <div key={message.ChatMessageId}>
                                {message.SenderUserId === username.userIdOfCurrentUser ? (
                                    <div className={ChatCSS.currentUserMessage}>
                                        {`${message.Message}`}
                                    </div>
                                ) : (
                                    <div className={ChatCSS.otherUserMessage}>
                                        {`${message.Message}`}
                                    </div>
                                )}
                            </div>
                            ))
                        ) : (
                            <h2>Please select a friend to start chatting.</h2>
                        )}
                    </div>
                    <div>
                        {selectedChat && <input className={ChatCSS.sendMessage} type="text" placeholder="Send a message..." onKeyDown={handleOnKeyDown} />}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ChatComponent