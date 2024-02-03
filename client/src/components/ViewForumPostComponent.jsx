import axios from "axios"
import { useState } from "react"
import { useParams } from "react-router-dom"
import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import { FourmPostCommentSection } from "./ForumPostCommentSection"
export const ViewForumPostComponent = () =>{
   let currentUsername = ""
   const location = useLocation()
   const state = location.state
   if(state && state.username){
      currentUsername = state.username
      console.log(currentUsername)
   }
   else{
    console.log("NONE")
   }

   const {postID} = useParams()  
   const [postObject, setPostObject] = useState() 

   useEffect(() => {

    const getForumPost = async () => {

        try{
           const response = await axios.get(`http://localhost:3001/forumPostsById/${postID}`)
            setPostObject(response.data)
            
        }
        catch(error){
            console.log(error)
        }
    }
    getForumPost()
    }, [])
    
   return (
    (postObject ? <div>
        <h1> {postObject[0].title} by {postObject[0].username} @ {new Date(postObject[0].post_timestamp).toLocaleString()} </h1>
        <p> {postObject[0].body} </p>
 
        <div>
          Tag(s) 
          <br></br>
          {postObject[0].forums}
        </div> 
        <div>
            <FourmPostCommentSection currentUser = {currentUsername} />
            <br></br>
        </div>
        
      </div>
      : <p> Loading... </p>)
   )

}
