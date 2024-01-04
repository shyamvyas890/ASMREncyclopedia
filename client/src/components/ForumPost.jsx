import react from "react";
import axios from "axios";
import { useState } from "react";
import { useEffect } from "react";
import * as yup from "yup"

//props contains the username 
export const ForumPostComponent = (props) =>{
    const schema = yup.object().shape({
        title: yup.string().required("You must have a title"),
        body: yup.string().required("You must have a body")
    })
    const [forumOptions, setForumOptions] = useState([])

    //get all current forums for creating a post
    useEffect(()=>{
        const fetchAllForums = async ()=>{
            try{
                const res = await axios.get("http://localhost:3001/forums")
                setForumOptions(res.data);
            }catch(err){
                console.log(err)
            }
        } 
        fetchAllForums()
    }, [])
    
    //get data from form (e.target.elements.<>.<>) and post to server
    const onSubmit =  async (e) => {
        e.preventDefault()
        const data = {
            title: e.target.elements.title.value,
            body: e.target.elements.title.value,
            forums: e.target.elements.forum.value,
            username: props.username
        }
        const isValid = await schema.isValid(data)
        if(isValid){
            axios.post('http://localhost:3001/forumPostCreate', data).then( (response) => {
                window.location.reload()
                console.log(response)
                alert("Post Succssful!")
            })
        }
        else{
            alert("Make sure to give your post a title and body!")
        }
    }

    //render fields for title, body and a select menu for all current forums
    return(
        <form onSubmit={onSubmit}> 
          <label> Post Title </label>
          <input type="text" name="title"/>
          <label> Post Body </label>
          <input type="text" name="body"/>
          <label> Forum </label>
          {forumOptions.length > 0 ? <select name="forum"> 
            <option value="NULL"> None </option>
            {forumOptions.map((forum) => (
                <option value={forum.title}> {forum.title} </option>
            ))}
          </select>: (<p> Loading Forums...</p>)}

         <input type="submit"/>
        </form>
    )
}