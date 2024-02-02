import React, { useState } from "react";
import axios from "axios";
import io from 'socket.io-client';
import { useNavigate } from "react-router-dom";
const hostname= "http://localhost:3001"
const ChatComponent =()=>{
    const [username, setUsername]= useState(null);
    const [socket,setSocket]= useState(null);
    
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
    }

    React.useEffect(()=>{
        tokenVerify();
    }, []);

    React.useEffect( ()=>{
        if(socket){
            socket.on('connect', () => {
                console.log('Connected to server:', socket.id);
            });
            socket.on('disconnect', () => {
                console.log('Disconnected from server');
            });
            socket.on('newMessage', (message) => {
                console.log('New message received:', message);
            });
            return ()=>{
                console.log("hello world")
                disconnectSocket();   
            }
        }
    },[socket]
    );

    
    


}


export default ChatComponent