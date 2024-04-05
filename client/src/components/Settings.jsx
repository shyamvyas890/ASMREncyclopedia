import React, { useState } from "react";
import axios from '../utils/AxiosWithCredentials';
import { useNavigate } from "react-router-dom";
import { axiosRequest } from "../utils/utils";
const SettingsComponent = ()=>{
    const hostname= "http://localhost:3001";
    const [username, setUsername]= React.useState(null);
    const [emailAndSubscriptionPreferences, setEmailAndSubscriptionPreferences]= useState(null);
    const [edit, setEdit] = useState({
        email: false,
        subscriptionPreferences:false,
        subscriptionForumPreferences: false,
        password: false
    })
    const [subscriptionRadio, setSubscriptionRadio]= useState(null);
    const [videoTags, setVideoTags]= useState([]);
    const [forumTags, setForumTags]= useState([]);

    const navigate= useNavigate();
    const tokenVerify= async (e) => {
            try{
                const response= await axios.get(`http://localhost:3001/verify-token`)
                if(response.data.username){
                    const userIdOfCurrentUser = (await axios.get(`${hostname}/users/id`, {params:{username:response.data.username}})).data.id;
                    setUsername({userIdOfCurrentUser, username:response.data.username})
                }
                else {
                    navigate("/");
                }
            }
    
            catch(error){
                console.log(error);
                navigate("/");
            }
        
    }
    React.useEffect(()=>{
        tokenVerify();
    },[])
    const getCurrentSettings = async ()=>{
        const email = (await axiosRequest(3, 2, "email", {UserId: username.userIdOfCurrentUser})).data[0].email;
        const videoSubscriptionOnly = (await axiosRequest(3,2,"videoSubscriptionOnly", {UserId: username.userIdOfCurrentUser})).data;
        const videoSubscriptions = (await axiosRequest(3,2,"videoSubscriptions", {UserId: username.userIdOfCurrentUser})).data;
        const forumSubscriptions = (await axios.get('http://localhost:3001/fetchForumSubscriptions', {
            params: {userID: username.userIdOfCurrentUser}
        })).data
        const forumSubscriptionOnly = (await axios.get('http://localhost:3001/fetchForumSubscriptionOnly', {
            params: {userID: username.userIdOfCurrentUser}
        })).data

        const newTags=[]
        for(const sub of videoSubscriptions){
            sub.GenreName = (await axiosRequest(3,2,"genreName", {GenreId: sub.GenreId})).data[0].Genre;
            newTags.push(sub.GenreName);
        }
        setVideoTags(newTags);
        setForumTags(forumSubscriptions)
        setEmailAndSubscriptionPreferences({email,videoSubscriptionOnly, videoSubscriptions, forumSubscriptionOnly, forumSubscriptions});
        console.log("tags: ", forumSubscriptionOnly)
        console.log("tags: ", forumSubscriptions)
    }
    React.useEffect(()=>{
        if(username){
            getCurrentSettings();
        }
    },[username])
    const changeEditEmail = ()=>{
        setEdit(prev=>({...prev, email:!prev.email}));
    }
    const changeEditSubscriptionPreferences = ()=>{
        setEdit(prev=>({...prev, subscriptionPreferences:!prev.subscriptionPreferences}));
    }
    const changeEditForumSubscriptionPreferences = ()=>{
        setEdit(prev=>({...prev, subscriptionForumPreferences:!prev.subscriptionForumPreferences}));
    }
    const changeEditPassword = ()=>{
        setEdit(prev=>({...prev, password:!prev.password}));
    }
    const editEmail = async (e)=>{
        e.preventDefault();
        const response = await axiosRequest(4,1,"email", {UserId:username.userIdOfCurrentUser, email:e.target.elements.emailInput.value});
        console.log(response);
        const email= e.target.elements.emailInput.value;
        setEmailAndSubscriptionPreferences(prev=>({...prev,email}))
        changeEditEmail();
        e.target.elements.emailInput.value="";
    }
    const editSubscription = async (e)=>{
        e.preventDefault();
        const deleteSubOnly = await axiosRequest(2,2,"videoSubscriptionOnly", {UserId:username.userIdOfCurrentUser});
        console.log(deleteSubOnly);
        const deleteSub= await axiosRequest(2,2, "videoSubscriptions", {UserId:username.userIdOfCurrentUser});
        console.log(deleteSub);
        if(subscriptionRadio==="except" || subscriptionRadio==="only"){
            let addSubOnly;
            if(subscriptionRadio==="except"){
                addSubOnly= await axiosRequest(1,1,"videoSubscriptionOnly", {UserId:username.userIdOfCurrentUser, Only:false});
            }
            else {
                addSubOnly= await axiosRequest(1,1,"videoSubscriptionOnly", {UserId:username.userIdOfCurrentUser, Only:true});    
            }
            console.log(addSubOnly);
            for(const tag of videoTags){
                const addSub= await axiosRequest(1,1,"videoSubscriptions", {UserId:username.userIdOfCurrentUser, Genre:tag});
                console.log(addSub);
            }
        }
        getCurrentSettings();
        changeEditSubscriptionPreferences();
        setSubscriptionRadio(null);
    }
    const editPassword= async (e)=>{
        e.preventDefault();
        if(e.target.elements.newPassword1.value!==e.target.elements.newPassword2.value){
            console.log("New passwords dont match")
            return;
        }
        const tryLoggingIn= await axiosRequest(1,1,"login", {username:username.username, password:e.target.elements.currentPassword.value});
        if(tryLoggingIn.status===200){
            const blacklistToken= await axios.post(`${hostname}/logout/${tryLoggingIn.data.token}`);
            const changePassword= await axiosRequest(4,1,"changePassword",{username:username.username, password:e.target.elements.newPassword1.value})
            changeEditPassword();
        }
        else{
            console.log("Current Password is incorrect, try again.")
        }
    }
    const handleOnKeyDown = (e)=>{
        if(e.key==="Enter" || e.key===","){
            e.preventDefault();
            const val= e.target.value.trim();
            addTag(val)
            e.target.value="";
        }
    }
    const handleRemovalOfTag = (e, removeThis)=>{
        e.preventDefault();
        setVideoTags(prevTags=>prevTags.filter(theTag=> theTag!==removeThis));
    }
    const addTag = (newTag)=>{
        if(newTag && !videoTags.includes(newTag)){
            setVideoTags(prevTags=>[...prevTags, newTag]);
        }
    }
    return (
        <React.Fragment>
            {(username && emailAndSubscriptionPreferences && !edit.email && !edit.subscriptionPreferences && !edit.password)? 
                (<>
                    <div>Your Current Settings</div>
                    <div>Email</div>
                    <div>{emailAndSubscriptionPreferences.email===null? "No email provided":emailAndSubscriptionPreferences.email}</div>
                    <button onClick={changeEditEmail}>{emailAndSubscriptionPreferences.email===null? "Add email": "Change email"}</button>
                    <div>Video Subscription Preferences</div>
                    <div>{emailAndSubscriptionPreferences.videoSubscriptionOnly.length===0? "All Genres": emailAndSubscriptionPreferences.videoSubscriptionOnly[0].Only===1?"Only These Genres": "All Genres Except These:"}</div>
                    {emailAndSubscriptionPreferences.videoSubscriptionOnly.length!==0 && (emailAndSubscriptionPreferences.videoSubscriptionOnly[0].Only===1 || emailAndSubscriptionPreferences.videoSubscriptionOnly[0].Only===0) &&
                    emailAndSubscriptionPreferences.videoSubscriptions.map((genre, index)=>(
                        <div key={index}>{genre.GenreName}</div>
                    ))}
                    <button onClick={changeEditSubscriptionPreferences}>Update Video Subscription Preferences</button>
                    
                    <div>Forum Subscription Preferences</div>
                    <div>{emailAndSubscriptionPreferences.forumSubscriptionOnly.length===0? "All Genres": emailAndSubscriptionPreferences.forumSubscriptionOnly[0].Only===1?"Only These Genres": "All Genres Except These:"}</div>
                    {emailAndSubscriptionPreferences.forumSubscriptionOnly.length!==0 && (emailAndSubscriptionPreferences.forumSubscriptionOnly[0].Only===1 || emailAndSubscriptionPreferences.forumSubscriptionOnly[0].Only===0) &&
                    emailAndSubscriptionPreferences.forumSubscriptions.map((tag, index)=>(
                        <div key={index}>{tag.ForumTagName}</div>
                    ))}
                    <button onClick={changeEditForumSubscriptionPreferences}>Update Forum Post Subscription Preferences</button>
                    <div>a{}</div>
                    <div>Security</div>
                    <button onClick={changeEditPassword}>Change Password</button>
                </>
                ):
                (username && emailAndSubscriptionPreferences && edit.email && !edit.subscriptionPreferences && !edit.password)?
                (
                    <form onSubmit={editEmail}>
                        <label>
                        Enter the new email.
                        <input type="email" name="emailInput" />
                        </label>
                        <button type="submit">Save Email</button>
                    </form>
                ):
                (username && emailAndSubscriptionPreferences && !edit.email && edit.subscriptionPreferences && !edit.password)?
                (
                    <form onSubmit={editSubscription}>
                        <style>
                            {`
                            .tag {
                                display: inline-block;
                                background-color: yellow;
                                color: black; 
                                padding: 5px;
                                margin: 5px;
                                border-radius: 5px;
                            }
                            
                            .tag-container {
                                display: inline-block;
                                padding: 5px;
                                margin-top: 5px;
                                border-radius: 5px;
                            }
                            `}
                        </style>
                        <div>Which ASMR video genres do you want to subscribe to?</div>
                        <label>All Genres
                            <input type="radio" name="subscriptionQuestion" value="all" onChange={()=>{setSubscriptionRadio("all")}} checked={subscriptionRadio==="all"}/>
                        </label>
                        <label>All Genres Except:
                        <input type="radio" name="subscriptionQuestion" value="except" onChange={()=>{setSubscriptionRadio("except")}} checked={subscriptionRadio==="except"}/>
                        </label>
                        <label>Only These Genres:
                        <input type="radio" name="subscriptionQuestion" value="only" onChange={()=>{setSubscriptionRadio("only")}} checked={subscriptionRadio==="only"}/>
                        </label>
                        {(subscriptionRadio==="except" || subscriptionRadio==="only") &&
                        <>
                            <label> Enter the genres, separated by commas (or press enter to add a genre)
                            <br/>
                            <input className="tag-container" onKeyDown={handleOnKeyDown} />
                            </label>
                            <br />
                            {videoTags.map((tag, index)=>(
                                <div key={index} className="tag">
                                    {tag}
                                    <button onClick={(e)=>{handleRemovalOfTag(e,tag)}}>&times;</button>
                                </div>
                            ))}
                        </>
                        }
                        <button type="submit">Update Subscription Preferences</button>
                    </form>
                ):
                (username && emailAndSubscriptionPreferences && !edit.email && !edit.subscriptionPreferences && edit.password)?
                (
                    <div></div>
                ):
                (username && emailAndSubscriptionPreferences && !edit.email && !edit.subscriptionPreferences && edit.password)?
                (
                    <form onSubmit={editPassword}>
                        <label>
                        Enter current password.
                        <input name="currentPassword" type="password" />
                        </label>
                        <label>
                        Enter new password.
                        <input name="newPassword1" type="password" />
                        </label>
                        <label>
                        Enter new password again.
                        <input name="newPassword2" type="password" />
                        </label>
                        <button type="submit"> Change Password</button>
                    </form>
                ):
                null}
        </React.Fragment>
    )
}

export default SettingsComponent;
