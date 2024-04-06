import React from "react";
import axios from '../utils/AxiosWithCredentials';
import { useNavigate } from "react-router-dom";
import {hostname, axiosRequest } from "../utils/utils";
import io from 'socket.io-client';
import "../index.css";
const NotificationsComponent = (props)=>{
    const [username, setUsername]= React.useState(null);
    const [socket,setSocket]= React.useState(null);
    const [showDropdown, setShowDropdown]= React.useState(false);
    const [notifications, setNotifications] = React.useState([]);
    const [notificationsElements, setNotificationsElements] = React.useState(null);
    const [unreadNotifications, setUnreadNotifications]= React.useState(null);
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
            setSocket(io(hostname, { transports : ['websocket'] }));
        }
        catch(error){
            navigate("/");
            console.log(error);
        }
    };
    React.useEffect(()=>{
        tokenVerify();
    }, []);
    React.useEffect(()=>{
        if(username){
            fetchNotifications();
        }    
    },[username]);
    React.useEffect(()=>{
        if(socket){
            socket.on('connect', handleConnect);
            socket.on('disconnect', handleDisconnect);
            socket.on('error', handleError);
            return ()=>{
                disconnectSocket();
                socket.off("disconnect", handleDisconnect);
                socket.off('error', handleError);
                socket.off("connect", handleConnect);
            }
        }
        
    },[socket]);
    React.useEffect(()=>{
        if(notifications.length!==0){
            const promises = notifications.map(async (notification, index) => {
                let thisPersonSentTheNotification;
                if(notification.VideoCommentSenderUserId!==undefined){
                    thisPersonSentTheNotification = await axiosRequest(3,2,"users/id",{UserId: notification.VideoCommentSenderUserId});
                }
                else if(notification.ForumCommentSenderUserId!==undefined){
                    thisPersonSentTheNotification = await axiosRequest(3,2,"users/id",{UserId: notification.ForumCommentSenderUserId});
                }
                console.log(`${thisPersonSentTheNotification.data.username} says: ${notification.Message}`);
                return <div key={index} style={{ background: notification.NotificationRead===1 ? "#161717" : "#606175", padding: "8px", border: "1px solid maroon", cursor:"pointer" }} onClick={(e) => {markAsRead(e,index)}}>
                    {`${thisPersonSentTheNotification.data.username} says: ${notification.Message}`}
                </div>
            });
            Promise.all(promises).then(resolvedPromises=>{
                setNotificationsElements(resolvedPromises);
            })
            
        }
    },[notifications]);
    React.useEffect( ()=>{
        if(socket && username && notifications && notificationsElements){
            console.log("I made it here")
            socket.on('newNotification', handleNewNotification);
            return ()=>{
                socket.off('newNotification', handleNewNotification);
            }
        }
    },[socket, username, notifications, notificationsElements]);
    const handleNewNotification = (notification)=>{
        console.log(notification);
        const updatedNotifications = [...notifications];
        updatedNotifications.unshift(notification);
        if(notifications.length===10 && props.AllNotificationsPage === undefined){
            updatedNotifications.pop();
        }
        const notificationInArray = [notification];
        const promises = notificationInArray.map(async (theNotification) => {
            let thisPersonSentTheNotification;
            if(theNotification.VideoCommentSenderUserId!==undefined){
                thisPersonSentTheNotification = await axiosRequest(3,2,"users/id",{UserId: theNotification.VideoCommentSenderUserId});
            }
            else if(theNotification.ForumCommentSenderUserId!==undefined){
                thisPersonSentTheNotification = await axiosRequest(3,2,"users/id",{UserId: theNotification.ForumCommentSenderUserId});
            }
            console.log(`${thisPersonSentTheNotification.data.username} says: ${theNotification.Message}`);
            return <div key={0} style={{ background: theNotification.NotificationRead===1 ? "#161717" : "#606175", padding: "8px", border: "1px solid maroon", cursor:"pointer" }} onClick={(e) => {markAsRead(e,0)}}>
                {`${thisPersonSentTheNotification.data.username} says: ${theNotification.Message}`}
            </div>
        });

        Promise.all(promises).then(resolvedPromises=>{
            const updatedNotificationsElements = [...notificationsElements];
            updatedNotificationsElements.unshift(resolvedPromises[0]);
            if(notificationsElements.length===10 && props.AllNotificationsPage === undefined){
                updatedNotificationsElements.pop();
            }
            const subarray = updatedNotificationsElements.splice(1);

            const cloneElementsAndReplaceKey = subarray.map(
                (element, index)=>(
                    React.cloneElement(element, {key: index+1})
                )
            );
            updatedNotificationsElements.push(...cloneElementsAndReplaceKey);
            setUnreadNotifications(prev=>prev+1);
            setNotifications(updatedNotifications);
            setNotificationsElements(updatedNotificationsElements);
        })   
    }
    const handleConnect = () => {
        console.log("Why is this not logging")
        console.log('Connected to server:', socket.id);
    };
    const handleDisconnect = () => {
        console.log('Disconnected from server');
    }
    const fetchNotifications = async (e)=>{
        console.log(username);
        let notificationsArr;
        if(props.AllNotificationsPage===undefined){
            notificationsArr = (await axiosRequest(3,2,"notifications", {UserId: username.userIdOfCurrentUser, Dropdown:true})).data;
        }
        else {
            notificationsArr = (await axiosRequest(3,2,"notifications", {UserId: username.userIdOfCurrentUser})).data;
        }
        const numberOfUnreadNotifications = (await axiosRequest(3,2,"notifications", {UserId: username.userIdOfCurrentUser, Dropdown:true, getUnreadCount:true})).data.UnreadNotifications;
        setUnreadNotifications(numberOfUnreadNotifications);
        setNotifications(notificationsArr);
    }
    const markAsRead = async (e, index) => {
        const updatedNotifications = [...notifications];
        if(updatedNotifications[index].SenderForumPostCommentId!==undefined){
            const markRead= await axios.patch(`${hostname}/notifications`, {ForumPostCommentId: updatedNotifications[index].SenderForumPostCommentId});
            console.log(markRead);
            window.open(`/SingleForumComment/${updatedNotifications[index].SenderForumPostCommentId}`, '_blank');
        }
        else if(updatedNotifications[index].SenderVideoPostCommentId!==undefined){
            const markRead= await axios.patch(`${hostname}/notifications`, {VideoPostCommentId: updatedNotifications[index].SenderVideoPostCommentId});
            console.log(markRead);
            window.open(`/SingleVideoComment/${updatedNotifications[index].SenderVideoPostCommentId}`, '_blank');
        }
        if(updatedNotifications[index].NotificationRead===0){
            updatedNotifications[index].NotificationRead = 1;
            setUnreadNotifications(prev=>prev-1);
            setNotifications(updatedNotifications);
        }
        
    };
    const handleError = (error) => {
        console.error("Socket connection error:", error);
    };
    console.log(notificationsElements);
    return (
        props.AllNotificationsPage === undefined? 
        (<div style={{position:"relative", width:"300px"}}>
            <button onClick= {()=>{setShowDropdown(prev=>!prev)}}style = {{marginLeft:"15rem", cursor:"pointer", borderRadius:"50%", backgroundColor:"black", border:"none", width:"55px", height:"55px"}}>
                <svg style={{stroke:"white"}} width="24" height="24" strokeWidth="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> 
                    <path
                        style={{stroke:"white"}}
                        d="M18.1336 11C18.7155 16.3755 21 18 21 18H3C3 18 6 15.8667 6 8.4C6 6.70261 6.63214 5.07475 7.75736 3.87452C8.88258 2.67428 10.4087 2 12 2C12.3373 2 12.6717 2.0303 13 2.08949" 
                        stroke="currentColor" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"/> 
                    <path
                        style={{stroke:"white"}} 
                        d="M19 8C20.6569 8 22 6.65685 22 5C22 3.34315 20.6569 2 19 2C17.3431 2 16 3.34315 16 5C16 6.65685 17.3431 8 19 8Z" 
                        stroke="currentColor" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"/> 
                    <path
                        style={{stroke:"white"}} 
                        d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" 
                        stroke="currentColor" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"/> 
                </svg>
                {unreadNotifications!==null && unreadNotifications!==0 && <span className="notification-badge">{unreadNotifications}</span>}
            </button> 
            
                {
                    showDropdown &&
                        <div style={{ position: "absolute", top: "calc(100%)", right: "0px", width: "200px", maxHeight: "200px", overflowY: "auto", backgroundColor: "black", zIndex: 1 }}>
                            {notificationsElements && notificationsElements.length > 0 ? (
                               <> 
                                {notificationsElements}
                                <button onClick={()=>{window.open(`/notifications`, '_blank');}}>See all notifications</button>
                                </>
                            ) : notificationsElements && notificationsElements.length===0 ?  (
                                <div>No notifications</div>
                            ): (
                                <div></div>
                            )}
                        </div>  
                }
            
        </div>): (
            <div style={{position:"relative", width:"100%"}}>
                <div>All Notifications</div>
                {notificationsElements && notificationsElements.length > 0 ? (
                        <>
                            {notificationsElements}
                        </>
                ): notificationsElements && notificationsElements.length===0 ? (
                    <div>No Notifications</div>
                ): (
                    <div></div>
                )}
            </div>
        )
    )
}

export default NotificationsComponent;