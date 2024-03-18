import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {hostname, axiosRequest } from "../utils/utils";
import io from 'socket.io-client';
const NotificationsDropdownComponent = ()=>{
    const [username, setUsername]= React.useState(null);
    const [socket,setSocket]= React.useState(null);
    const [showDropdown, setShowDropdown]= React.useState(false);
    const [notifications, setNotifications] = React.useState([]);
    const navigate= useNavigate();

    const disconnectSocket = () => {
        console.log(`socket is ${socket}`)
        if (socket) {
            socket.disconnect();
        }
    };
    
    const tokenVerify= async () => {
        const theToken= localStorage.getItem("token");
        if(theToken){
            try{
                const response= await axios.get(`http://localhost:3001/verify-token/${theToken}`)
                if(response.data.username){
                    const userIdOfCurrentUser = (await axios.get(`${hostname}/users/id`, {params:{username:response.data.username}})).data.id;
                    setUsername({userIdOfCurrentUser, username:response.data.username})
                    setSocket(io(hostname, { transports : ['websocket'], query:{token:localStorage.getItem("token")}}));
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
    };

    React.useEffect(()=>{
        tokenVerify();
    }, []);

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
            socket.on('newNotification', handleNewNotification);
            return ()=>{
                console.log("hello world")
                socket.off('newNotification', handleNewNotification);
                socket.off("connect", handleConnect);
            }
        }
    },[socket]
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
    return (
        <>
            <button style = {{marginLeft:"15rem", cursor:"pointer"}}>
                <svg width="24" height="24" strokeWidth="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> 
                    <path 
                        d="M18.1336 11C18.7155 16.3755 21 18 21 18H3C3 18 6 15.8667 6 8.4C6 6.70261 6.63214 5.07475 7.75736 3.87452C8.88258 2.67428 10.4087 2 12 2C12.3373 2 12.6717 2.0303 13 2.08949" 
                        stroke="currentColor" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"/> 
                    <path 
                        d="M19 8C20.6569 8 22 6.65685 22 5C22 3.34315 20.6569 2 19 2C17.3431 2 16 3.34315 16 5C16 6.65685 17.3431 8 19 8Z" 
                        stroke="currentColor" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"/> 
                    <path 
                        d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" 
                        stroke="currentColor" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"/> 
                </svg>
            </button>
            <div>

            </div>
        </>
    )


    

}

export default NotificationsDropdownComponent;