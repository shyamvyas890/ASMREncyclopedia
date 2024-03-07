import { useState, useEffect } from "react";
import {useNavigate } from "react-router-dom";
import * as yup from "yup"
import axios from "axios";

export const UserPlaylistComponent = ()=>{
    const [currentUsername, setCurrentUsername] = useState()
    const [currentUserID, setCurrentUserID] = useState()
    const [userPlaylists, setUserPlaylists] = useState([])

    const [playlistName, setPlaylistName] = useState("")

    const navigate = useNavigate()

    useEffect(()=> {
        const token = localStorage.getItem("token")
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
        const fetchUsername = async () => {
            try {
            const res = await axios.get(`http://localhost:3001/verify-token/${token}`);
            setCurrentUsername(res.data.username);
            } catch (error) {
            console.log(error);
            }
        };
        fetchUsername()
        fetchAllUserPlaylist()
    }, [])

    //gets the ID of the current user
    useEffect(() => {
        const fetchID = async () => {
            try {
              const res = await axios.get(`http://localhost:3001/users/id?username=${currentUsername}`);
              setCurrentUserID(res.data.id)
            } catch (error) {
              console.log(error);
            }
          };
        fetchID()
    }, [currentUsername])

    //form schema to ensure users enter a playlist title
    const schema = yup.object().shape({
        playlistName: yup.string().required("You must have a name"),
    })

    const onSubmit = async (e) => {
        e.preventDefault()
        const isValid = await schema.isValid({playlistName: playlistName}) //valid schema according to yup
        if(isValid){
            await axios.post('http://localhost:3001/createPlaylist', {}, {
                params: {playlistName: playlistName, userID: currentUserID}
            }) //post to database
            const res = await axios.get('http://localhost:3001/fetchAllUserPlaylists') 
            setUserPlaylists(res.data)
            //resetting useStates and text boxes
            setPlaylistName("")
        }
        else{
            alert("Make sure to give your playlist a name!")
        }
      }

    return (
        <div>
            <h1>Playlists</h1>

            <h2>Create Playlist</h2>
            <forms>
                <label> Playlist Name</label>
                <input type="name" value={playlistName} onChange= {(event) => {setPlaylistName(event.target.value)}}/>
                <br></br>
                <button onClick={onSubmit}>Create</button>
            </forms>

            {userPlaylists.map(playlist=>(
                <div className="user-playlist" key={playlist.playlistID}>
                    <h2>{playlist.PlaylistName}</h2>
                    <button onClick={ () => navigate(`/userPlaylists/${playlist.PlaylistID}/viewing/${currentUserID}/user`)}> {playlist.PlaylistName} </button>
                </div>
            ))}
    </div>)
}            