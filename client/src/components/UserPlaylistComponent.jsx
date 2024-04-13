import { useState, useEffect } from "react";
import {useNavigate } from "react-router-dom";
import * as yup from "yup"
import axios from '../utils/AxiosWithCredentials';

export const UserPlaylistComponent = ()=>{
    const [currentUsername, setCurrentUsername] = useState()
    const [currentUserID, setCurrentUserID] = useState()
    const [userPlaylists, setUserPlaylists] = useState([])
    const [playlistName, setPlaylistName] = useState("")
    const [editPlaylistID, setEditPlaylistID] = useState()
    const [editName, setEditName] = useState("")
    const [modal, setModal] = useState(false)
    const navigate = useNavigate()

    useEffect(()=> {
        const fetchUsername = async () => {
            try {
              const response = await axios.get(`http://localhost:3001/verify-token`);
              setCurrentUsername(response.data.username);
            } catch (error) {
              console.log(error);
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
            alert("Make sure to give your playlist a name!")
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
            alert("Make sure to give your playlist a name!")
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
            <h1>Playlists</h1>

            <h2>Create Playlist</h2>
            <forms>
                <label> Playlist Name</label>
                <input type="name" value={playlistName} onChange= {(event) => {setPlaylistName(event.target.value)}}/>
                <br></br>
                <button onClick={postPlaylistSubmit}>Create</button>
            </forms>

            {userPlaylists.map(playlist=>(
                <div className="user-playlist" key={playlist.PlaylistID}>
                    <h2>{playlist.PlaylistName}</h2>
                    <button onClick={()=> navigate(`/userPlaylists/${playlist.PlaylistID}/viewing/${currentUserID}/user`)}> View Playlist </button>
                    <button onClick={()=>{deletePlaylist(playlist.PlaylistID)}}>delete</button>
                    <button onClick={()=>toggleModal(playlist.PlaylistID)} className="btn-Modal">Edit Name</button>
                </div>
            ))}
            {modal && (
                <div className="modal">
                    <div onClick={toggleModal} className="overlay"></div>
                    <div className="modal-content">
                        <div className="edit-playlist">
                        <label> Playlist Name</label>
                            <input type="name" value={editName} onChange= {(event) => {setEditName(event.target.value)}}/>
                            <br></br>
                            <button onClick={editPlaylistSubmit}>Edit</button>
                        </div>
                        <button className="close-modal" onClick={toggleModal}>Close</button>
                    </div>
                </div>
            )}
    </div>
    )
} 