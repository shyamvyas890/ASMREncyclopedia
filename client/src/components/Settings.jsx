import React, { useState } from "react";
import axios from '../utils/AxiosWithCredentials';
import { useNavigate } from "react-router-dom";
import { axiosRequest } from "../utils/utils";
import NavigationComponent from "./Navigation";

const SettingsComponent = ()=>{
    const hostname= "http://localhost:3001";
    const [username, setUsername]= React.useState(null);
    const [emailAndSubscriptionPreferences, setEmailAndSubscriptionPreferences]= useState(null);
    const [edit, setEdit] = useState({
        email: false,
        subscriptionPreferences:false,
        forumSubscriptionPreferences: false,
        password: false,
        accountDeletion: false
    })
    const [subscriptionRadio, setSubscriptionRadio]= useState(null);
    const [forumSubscriptionRadio, setForumSubscriptionRadio]= useState(null);
    const [videoTags, setVideoTags]= useState([]);
    const [forumTags, setForumTags]= useState([]);
    const [errorMessageForChangingPasswordAndDeletingAccount, setErrorMessageForChangingPasswordAndDeletingAccount] = React.useState("");

    const navigate= useNavigate();
    const tokenVerify= async (e) => {
            try{
                const response= await axios.get(`http://localhost:3001/verify-token`)
                const userIdOfCurrentUser = (await axios.get(`${hostname}/users/id`, {params:{username:response.data.username}})).data.id;
                setUsername({userIdOfCurrentUser, username:response.data.username})
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
        const newForumTags=[]
        for(const sub of forumSubscriptions){
            const val = sub.ForumTagName.trim()
            console.log(val)
            newForumTags.push(val)
        }
        setVideoTags(newTags);
        setForumTags(newForumTags)
        setEmailAndSubscriptionPreferences({email,videoSubscriptionOnly, videoSubscriptions, forumSubscriptionOnly, forumSubscriptions});
        console.log("videotags: ", newTags)
        console.log("forumtags: ", newForumTags)
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
        setEdit(prev=>({...prev, forumSubscriptionPreferences:!prev.forumSubscriptionPreferences}));
    }
    const changeEditPassword = ()=>{
        setEdit(prev=>({...prev, password:!prev.password}));
    }
    const changeEditDeleteAccount = ()=>{
        setEdit(prev=>({...prev, accountDeletion:!prev.accountDeletion}));
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
                console.log("videoTag: ", tag)
                const addSub= await axiosRequest(1,1,"videoSubscriptions", {UserId:username.userIdOfCurrentUser, Genre:tag});
                console.log(addSub);
            }
        }
        getCurrentSettings();
        changeEditSubscriptionPreferences();
        setSubscriptionRadio(null);
    }

    const editForumSubscription = async (e)=>{
        e.preventDefault();
        console.log("go: ", emailAndSubscriptionPreferences.forumSubscriptionOnly)

        if(emailAndSubscriptionPreferences.forumSubscriptionOnly){   //If exists delete
            console.log("delete")
            await axios.delete("http://localhost:3001/deleteForumSubscriptionOnly/")
            await axios.delete("http://localhost:3001/deleteForumSubscription/")
        }
        if(forumSubscriptionRadio==="except" || forumSubscriptionRadio==="only"){
            let addSubOnly;
            if(forumSubscriptionRadio==="except"){
                await axios.post("http://localhost:3001/createForumSubscriptionOnly/", {}, {
                    params: { Only: 0 }
                })
            }
            else {
                await axios.post("http://localhost:3001/createForumSubscriptionOnly/", {}, {
                    params: { Only: 1 }
                })            
            }
            console.log(addSubOnly);
            for(const tag of forumTags){ //Insert Ignore
                console.log("forumTag: ", tag)
                await axios.post("http://localhost:3001/forumTagCreate/", {}, {
                    params: { forumTagName: tag }
                })
                const tagID = await axios.get("http://localhost:3001/fetchForumTag/", {
                    params: { forumTagName: tag }
                })
                console.log("tagID: ", tagID)
                await axios.post("http://localhost:3001/createForumSubscription/", {}, {
                    params: { ForumTagID: tagID.data[0].ForumTagID }
                })
            }
        }
        getCurrentSettings();
        changeEditForumSubscriptionPreferences();
        setForumSubscriptionRadio(null);
    }
    const editPassword= async (e)=>{
        e.preventDefault();
        if(e.target.elements.newPassword1.value!==e.target.elements.newPassword2.value){
            e.target.elements.newPassword1.value=""
            e.target.elements.newPassword2.value=""
            e.target.elements.currentPassword.value=""
            setErrorMessageForChangingPasswordAndDeletingAccount("New passwords dont match")
            return;
        }
        try{
            const changePassword= await axiosRequest(4,1,"changePassword",{username:username.username, oldPassword:e.target.elements.currentPassword.value, newPassword:e.target.elements.newPassword1.value})
            console.log(changePassword)
            setErrorMessageForChangingPasswordAndDeletingAccount("")
            changeEditPassword();
        }
        catch(error){
            e.target.elements.newPassword1.value=""
            e.target.elements.newPassword2.value=""
            e.target.elements.currentPassword.value=""
            setErrorMessageForChangingPasswordAndDeletingAccount(error.response.data);
        }
    }
    const tryDeletion = async (e)=>{
        e.preventDefault()
        console.log(e);
        try{
            const accountDeletionAttempt = await axiosRequest(1,1,"accountDeletionRequest", {password: e.target.elements.currentPassword.value});
            e.target.elements.currentPassword.value="";
            console.log(accountDeletionAttempt);
            navigate("/");
        }
        catch(error){
            e.target.elements.currentPassword.value=""
            setErrorMessageForChangingPasswordAndDeletingAccount(error.response.data);
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
    const forumHandleOnKeyDown = (e)=>{
        if(e.key==="Enter" || e.key===","){
            e.preventDefault();
            const val= e.target.value.trim();
            console.log(val)
            addForumTag(val)
            e.target.value="";
        }
    }
    const handleRemovalOfForumTag = (e, removeThis)=>{
        e.preventDefault();
        setForumTags(prevTags=>prevTags.filter(theTag=> theTag!==removeThis));
    }
    const addForumTag = (newTag)=>{
        if(newTag && !forumTags.includes(newTag)){
            setForumTags(prevTags=>[...prevTags, newTag]);
        }
    }
    return (
        <React.Fragment>
            <NavigationComponent />
            {(username && emailAndSubscriptionPreferences && !edit.email && !edit.subscriptionPreferences && !edit.password && !edit.forumSubscriptionPreferences && !edit.accountDeletion)? 
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
                     
                    <div>{emailAndSubscriptionPreferences.forumSubscriptionOnly.length===0? "All Genres": emailAndSubscriptionPreferences.forumSubscriptionOnly[0].Only===1?"Only These Tags": "All Genres Except These:"}</div>
                    {emailAndSubscriptionPreferences.forumSubscriptionOnly.length!==0 && (emailAndSubscriptionPreferences.forumSubscriptionOnly[0].Only===1 || emailAndSubscriptionPreferences.forumSubscriptionOnly[0].Only===0) &&
                    emailAndSubscriptionPreferences.forumSubscriptions.map((tag, index)=>(
                        <div key={index}>{tag.ForumTagName}</div>
                    ))}
                    <button onClick={changeEditForumSubscriptionPreferences}>Update Forum Post Subscription Preferences</button>
                    <div>Security</div>
                    <button onClick={changeEditPassword}>Change Password</button>
                    <button style={{color:"red"}} onClick={changeEditDeleteAccount}>Delete Account</button>
                </>
                ):
                (username && emailAndSubscriptionPreferences && edit.email && !edit.subscriptionPreferences && !edit.password && !edit.forumSubscriptionPreferences && !edit.accountDeletion)?
                (
                    <form onSubmit={editEmail}>
                        <label>
                        Enter the new email.
                        <input type="email" name="emailInput" />
                        </label>
                        <button type="submit">Save Email</button>
                    </form>
                ):
                (username && emailAndSubscriptionPreferences && !edit.email && !edit.subscriptionPreferences && !edit.password && edit.forumSubscriptionPreferences && !edit.accountDeletion)?
                (
                    <form onSubmit={editForumSubscription}>
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
                        <div>Which ASMR forum tags do you want to subscribe to?</div>
                        <label>All Tags
                            <input type="radio" name="forumSubscriptionQuestion" value="all" onChange={()=>{setForumSubscriptionRadio("all")}} checked={forumSubscriptionRadio==="all"}/>
                        </label>
                        <label>All Tags Except:
                        <input type="radio" name="forumSubscriptionQuestion" value="except" onChange={()=>{setForumSubscriptionRadio("except")}} checked={forumSubscriptionRadio==="except"}/>
                        </label>
                        <label>Only These Tags:
                        <input type="radio" name="forumSubscriptionQuestion" value="only" onChange={()=>{setForumSubscriptionRadio("only")}} checked={forumSubscriptionRadio==="only"}/>
                        </label>
                        {(forumSubscriptionRadio==="except" || forumSubscriptionRadio==="only") &&
                        <>
                            <label> Enter the tags, separated by commas (or press enter to add a tag)
                            <br/>
                            <input className="tag-container" onKeyDown={forumHandleOnKeyDown} />
                            </label>
                            <br />
                            {forumTags.map((tag, index)=>(
                                <div key={index} className="tag">
                                    {tag}
                                    <button onClick={(e)=>{handleRemovalOfForumTag(e,tag)}}>&times;</button>
                                </div>
                            ))}
                        </>
                        }
                        <button type="submit">Update Subscription Preferences</button>
                    </form>
                ):
                (username && emailAndSubscriptionPreferences && !edit.email && edit.subscriptionPreferences && !edit.password && !edit.forumSubscriptionPreferences && !edit.accountDeletion)?
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
                (username && emailAndSubscriptionPreferences && !edit.email && !edit.subscriptionPreferences && edit.password && !edit.forumSubscriptionPreferences && !edit.accountDeletion)?
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
                        <button onClick={()=>{setEdit(prevEdit=>{setErrorMessageForChangingPasswordAndDeletingAccount(""); return {...prevEdit, password: !prevEdit.password};})}}>Cancel</button>
                        <div style={{color:"red"}}>{errorMessageForChangingPasswordAndDeletingAccount}</div>
                        <button type="submit"> Change Password</button>
                    </form>
                ):
                (username && emailAndSubscriptionPreferences && !edit.email && !edit.subscriptionPreferences && !edit.password && !edit.forumSubscriptionPreferences && edit.accountDeletion)?
                (<form onSubmit={tryDeletion}>
                    <div style={{color:"red"}}>Are you sure you want to do this? This action cannot be undone. If you are sure, enter your password below to confirm this action.</div>
                    <label>
                        Enter your current password.
                        <input name="currentPassword" type="password" />
                        <button onClick={()=>{setEdit(prevEdit=>{setErrorMessageForChangingPasswordAndDeletingAccount(""); return {...prevEdit, accountDeletion: !prevEdit.accountDeletion};})}}>Cancel</button>
                        <button type="submit">Delete</button>
                        <div style={{color:"red"}}>{errorMessageForChangingPasswordAndDeletingAccount}</div>
                    </label>
                </form>):
                null}
        </React.Fragment>
    )
}

export default SettingsComponent;
