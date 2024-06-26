import react from "react";
import axios from '../utils/AxiosWithCredentials';
import { useState } from "react";
import { useEffect } from "react";
import * as yup from "yup"

//props contains the username 
export const ForumPostComponent = () =>{
    const schema = yup.object().shape({
        title: yup.string().required("You must have a title"),
        body: yup.string().required("You must have a body")
    })

    const [tagOptions, setTagOptions] = useState([])
    const [title, setTitle] = useState()
    const [body, setBody] = useState()
    const [tagInput, setTagInput] = useState()
    const [currentUsername, setCurrentUsername] = useState()

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

    //get data from form (e.target.elements.<>.<>) and post to server
    const onSubmit =  async (e) => {
        e.preventDefault()
        console.log(currentUsername)
        const data = {
            title: title,
            body: body,
            forums: tagOptions,
            username: currentUsername
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

    const handleInputKeyDown = (e) =>{
        if(e.key === 'Enter' && tagInput.trim() != ''){
            e.preventDefault()
            setTagOptions([...tagOptions, tagInput])
            setTagInput('')
        }
    }

    const handleTagDelete = (tagToRemove) =>{
        setTagOptions(tagOptions.filter(tag => tag !== tagToRemove))
    }
    //render fields for title, body and a select menu for all current forums
    return(
        <form> 
          <label> Post Title </label>
          <input type="text" onChange= {(event) => {setTitle(event.target.value)}} name="title"/>
          <br></br>
          <label> Post Body </label>
          <input type="text" onChange= {(event) => {setBody(event.target.value)}} name="body"/>
          <br>
          </br>
          <div>
           <label> Press "Enter" to create post tag(s) </label>
           <input type="text" onChange={ (event) => {setTagInput(event.target.value)}} onKeyDown={handleInputKeyDown}/>
           <br>
           </br>
           <div>
             {tagOptions.map( (tag) => (
                <div>
                    {tag}
                    <button onClick={() => handleTagDelete(tag)}> x </button>
                </div>
             ))}
           </div>
          </div>
         <button onClick={onSubmit}> Create Post </button>
        </form>
    )
}