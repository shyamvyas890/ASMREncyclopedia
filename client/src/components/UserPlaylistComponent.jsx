import { useState, useEffect } from "react";
import {useNavigate } from "react-router-dom";
import * as yup from "yup"
import axios from '../utils/AxiosWithCredentials';
import NavigationComponent from "./Navigation";
import PlaylistCSS from "../css/playlist.module.css"

export const UserPlaylistComponent = ()=>{
    const [currentUsername, setCurrentUsername] = useState()
    const [currentUserID, setCurrentUserID] = useState()
    const [userPlaylists, setUserPlaylists] = useState([])
    const [playlistName, setPlaylistName] = useState("")
    const [editPlaylistID, setEditPlaylistID] = useState()
    const [editName, setEditName] = useState("")
    const [modal, setModal] = useState(false)
    const navigate = useNavigate()

    const [feedback, setFeedback] = useState(null)
    useEffect(()=> {
        const fetchUsername = async () => {
            try {
              const response = await axios.get(`http://localhost:3001/verify-token`);
              setCurrentUsername(response.data.username);
            } catch (error) {
              navigate("/")
            }
          };
        fetchUsername()
    }, [])

    //gets the ID of the current user
    useEffect( () => {
        const fetchID = async () => {
            try {
              const response = await axios.get(`http://localhost:3001/users/id?username=${currentUsername}`);
              setCurrentUserID(response.data.id)
            } catch (error) {
              console.log(error);
            }
          };
        fetchID()
        
    }, [currentUsername])

    useEffect(()=>{
        fetchAllUserPlaylist()
    }, [currentUserID])

    const fetchAllUserPlaylist = async () => {
        try{
            const res = await axios.get("http://localhost:3001/fetchAllUserPlaylists", {
                params: { userID: currentUserID}
            })
            setUserPlaylists(res.data)
        } catch (error) {
            console.log(error)
        }
    }

    //form schema to ensure users enter a playlist title
    const postPlaylistSchema = yup.object().shape({
        playlistName: yup.string().required("You must have a name"),
    })

    const editPlaylistSchema = yup.object().shape({
        editName: yup.string().required("You must have a name"),
    })

    const postPlaylistSubmit = async (e) => {
        e.preventDefault()
        const isValid = await postPlaylistSchema.isValid({playlistName: playlistName}) //valid schema according to yup
        if(isValid){
            await axios.post('http://localhost:3001/createPlaylist', {}, {
                params: {playlistName: playlistName, userID: currentUserID}
            })
            //update
            fetchAllUserPlaylist()
            setPlaylistName("")
        }
        else{
            setFeedback("Make sure to give your playlist a name!")
        }
        fetchAllUserPlaylist()
    }
    
    const toggleModal = (editPlaylistID) =>{
        setEditPlaylistID(editPlaylistID)
        setEditName("")
        setModal(!modal)
        console.log(modal)
    }

    const editPlaylistSubmit = async (e) =>{
        e.preventDefault()
        const isValid = await editPlaylistSchema.isValid({editName: editName}) //valid schema according to yup
        if(isValid){
            await axios.put('http://localhost:3001/editPlaylistName', {}, {
                params: {playlistID: editPlaylistID, newPlaylistName: editName}
            }) 
            //edit playlist
            fetchAllUserPlaylist()
            setPlaylistName("")
        }
        else{
            setFeedback("Make sure to give your playlist a name!")
        }
        fetchAllUserPlaylist()
        toggleModal()
    }

    const deletePlaylist = async (playlistID) =>{
        console.log(playlistID)
        try{
            await axios.delete("http://localhost:3001/deletePlaylist", {
                params: { playlistID: playlistID}
            })
        } catch (error){
            console.log(error)
        }
        fetchAllUserPlaylist()
    }

    return (
        <div>
            <NavigationComponent />
            <div className={PlaylistCSS.createPlaylistContainer}>
                <h2>Create New Playlist</h2>
                <form className={PlaylistCSS.userPlaylistForm}>
                    <input type="name" placeholder="Playlist Name" value={playlistName} onChange={(event) => { setPlaylistName(event.target.value) }} />
                    {feedback && (
                    <p style={{color: "red"}}>{feedback}</p>
                    )}

                    <button className="btn btn-primary" onClick={postPlaylistSubmit}>Create</button>
                </form>
            </div>
            {userPlaylists.length === 0 ? (
                <h1>Create a Playlist!</h1>
            ) : (
                    <h1>Playlists</h1>
                )
            }
            {userPlaylists.length !== 0 && userPlaylists.map(playlist => (
                <div className={PlaylistCSS.userPlaylist} key={playlist.PlaylistID}>
                    <h2>{playlist.PlaylistName}</h2>
                    <button onClick={() => navigate(`/userPlaylists/${playlist.PlaylistID}/viewing/${currentUserID}/user`)} className="btn btn-primary"> View Playlist </button>
                    <button onClick={() => toggleModal(playlist.PlaylistID)} className="btn btn-primary">Edit Name</button>
                    <button onClick={() => {deletePlaylist(playlist.PlaylistID)}} className="btn btn-danger">Delete</button>
                </div>
            ))}
            {modal && (
                <div className={PlaylistCSS.modal}>
                    <div onClick={toggleModal} className={PlaylistCSS.overlay}></div>
                        <div className={PlaylistCSS.modalContentContainer}>
                            <div className={PlaylistCSS.modalContent}>
                                <div className={PlaylistCSS.editPlaylistForm}>
                                    <h2>Edit Playlist Name</h2>
                                    <input type="name" value={editName} placeholder="New Playlist Name" onChange={(event) => {setEditName(event.target.value)}}/>
                                    <button className="btn btn-primary" onClick={editPlaylistSubmit}>Edit</button>
                                    <button className="btn btn-secondary" onClick={toggleModal}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}