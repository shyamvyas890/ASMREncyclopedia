import axios from "axios"
import { useParams } from "react-router-dom"
import { useState } from "react"
import { useEffect } from "react"

export const SearchForumPostComponent = () =>{
    const {searchTitle} = useParams()
    const [searchResults, setSearchResults] = useState([])

    //get all forumposts whose title contains the searchTitle 
    useEffect(()=>{
        const searchForPosts = async ()=>{
            try{
                const response = await axios.get(`http://localhost:3001/forumPostSearch/${searchTitle}`)
                console.log(response.data)
                console.log("???")
            }catch(err){
                console.log(err)
            }
        } 
        searchForPosts()
    }, [])

    return(
        <h1> Search results for '{searchTitle}' </h1>
            
    )
    
}