import axios from '../utils/AxiosWithCredentials';
import { useParams } from "react-router-dom"
import { useState } from "react"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
export const SearchForumPostComponent = () =>{
    const navigate = useNavigate()
    const {searchTitle} = useParams()
    const [searchResults, setSearchResults] = useState([])
    const [currentUsername, setCurrentUsername] = useState()
    const [currentUserID, setCurrentUserID] = useState()
   
    //gets the username of the current user
    useEffect( () => {
        const token = localStorage.getItem("token")
        const fetchUsername = async () => {
            try {
              const response = await axios.get(`http://localhost:3001/verify-token/${token}`);
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

    //get all forumposts whose title contains the searchTitle 
    useEffect(()=>{
        const searchForPosts = async ()=>{
            try{
                const response = await axios.get(`http://localhost:3001/forumPostSearch/${searchTitle}`)
                setSearchResults(response.data)
            }catch(err){
                console.log(err)
            }
        } 
        searchForPosts()
    }, [])

    return(
        <div>
        <h1> Search results for '{searchTitle}' </h1>

        <div>
            {searchResults.length === 0 ? (<div> No results for {searchTitle}</div>) :

            searchResults.map(post => (
                <div>
                   <h2>{post.title} by {post.username} @ {new Date(post.post_timestamp).toLocaleString()}</h2>
                   <p>{post.body}</p>
                   <div>
                   Tag(s)
                   <br></br>
                   {post.forums}
                   <br></br>
                   <button onClick={ () => navigate(`/forumPost/${post.id}/viewing/${currentUserID}/user`)}> View Post </button>
                </div>
                </div>
            ))}
            
        </div>
        </div>
    )
}