import axios from "axios"
import { useState } from "react"
import { useParams } from "react-router-dom"
import { useEffect } from "react"

export const ViewForumPostComponent = () =>{
   const {id} = useParams()   
   const [postObject, setPostObject] = useState() 
   console.log(id)

   useEffect(() => {

    const getForumPost = async () => {

        try{
           const response = await axios.get(`http://localhost:3001/forumPostsById/${id}`)
            setPostObject(response.data)
            console.log(postObject)
        }
        catch(error){
            console.log(error)
        }
    }
    getForumPost()
    }, [])

   return (
    (postObject ? <div>
        <h1> {postObject[0].title} by {postObject[0].username} @ {postObject[0].post_timestamp} </h1>
        <p> {postObject[0].body} </p>
      </div> : <p> Loading... </p>)
   )

}
