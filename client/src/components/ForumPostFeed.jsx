import axios from "axios";
import { useState, useEffect } from "react";
import { redirectDocument, useNavigate } from "react-router-dom";
import LikeDislikeComponent from "./LikeDislikeComponent"
import * as yup from "yup"
import '../App.css';

export const ForumPostFeedComponent = (props) =>{
    const [allPosts, setAllPosts] = useState([])
    //Maps contain {[postID, #of likes/dislikes]}
    const [allPostLikes, setAllPostLikes] = useState(new Map())
    const [allPostDislikes, setAllPostDislikes] = useState(new Map())
    const [userLikedPosts, setUserLikedPosts] = useState([])
    const [userDislikedPosts, setUserDislikedPosts] = useState([])
    const [currentUsername, setCurrentUsername] = useState()
    const [currentUserID, setCurrentUserID] = useState()
    const [sortType, setSortType] = useState()

    const [tagOptions, setTagOptions] = useState([])
    const [title, setTitle] = useState()
    const [body, setBody] = useState()
    const [tagInput, setTagInput] = useState()
    const navigate = useNavigate()
    

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

    //get all forumposts, initially sort from newest to oldest 
    useEffect(()=>{
    const fetchAllPosts = async ()=>{
        try{
            const res = await axios.get("http://localhost:3001/forumPostsAll")
            //initially sort from newest to oldest
            setAllPosts(res.data)
            const intialPosts = res.data.sort((a, b) => {
              if(a.post_timestamp > b.post_timestamp){
                return -1;
              }
              else if(a.post_timestamp < b.post_timestamp){
                return 1;
              }
              else{
                return 0;
              }
            })
            setAllPosts(intialPosts)
        }catch(err){
            console.log(err)
        }
    } 
    fetchAllPosts()
}, [])

//get like/dislike information for posts
useEffect(() => {
    fetchAllPostsLikesAndDislikes();
}, [allPosts]);

const fetchAllPostsLikesAndDislikes = async () => {
    await LikeDislikeComponent.fetchAllPostsLikes(allPosts, setAllPostLikes);
    await LikeDislikeComponent.fetchAllPostsDislikes(allPosts, setAllPostDislikes);
    await LikeDislikeComponent.fetchUserLikedPosts(props.userID, allPosts, setUserLikedPosts);
    await LikeDislikeComponent.fetchUserDislikedPosts(props.userID, allPosts, setUserDislikedPosts);
};

const handleLikeDislike = async (postID, userID, rating) => {
    await LikeDislikeComponent.handleLikeDislike(postID, userID, rating);
    //updates the likes/dislikes
    fetchAllPostsLikesAndDislikes();
}

//sort forumposts based off user choice 
//sorting based on time uses post_timestamp attribute
//sortinb based on likes uses allPostLikes map
const sortForumPosts = (e) =>{
  e.preventDefault()
  //newest to oldest
   if(sortType === '1'){
    const postsOldToNew = [...allPosts].sort((a, b) => {
      if(a.post_timestamp > b.post_timestamp){
        console.log(a.post_timestamp);
        return -1;
      }
      else if(a.post_timestamp < b.post_timestamp){
        return 1;
      }
      else{
        return 0;
      }
    })
    setAllPosts(postsOldToNew)
   }
   //oldest to newest
   else if(sortType === '2'){
    const postsOldToNew = [...allPosts].sort((a, b) => {
      if(a.post_timestamp > b.post_timestamp){
        console.log(a.post_timestamp);
        return 1;
      }
      else if(a.post_timestamp < b.post_timestamp){
        return -1;
      }
      else{
        return 0;
      }
    })
    setAllPosts(postsOldToNew)
   }
   //most liked to least liked
   else if(sortType === '3'){
      allPosts.map(post => (
        console.log(allPostLikes.get(post.id))
      ))
      const postsMostLiked = [...allPosts].sort( (a, b) =>{
        if(allPostLikes.get(a.id) > allPostLikes.get(b.id)){
          return -1;
        }
        else if(allPostLikes.get(a.id) < allPostLikes.get(b.id)){
          return 1;
        }
        else{
          return 0;
        }
      })
      setAllPosts(postsMostLiked)

   }
   //least liked to most liked
   else{
    allPosts.map(post => (
      console.log(allPostLikes.get(post.id))
    ))
    const postsLeastLiked = [...allPosts].sort( (a, b) =>{
      if(allPostLikes.get(a.id) > allPostLikes.get(b.id)){
        return 1;
      }
      else if(allPostLikes.get(a.id) < allPostLikes.get(b.id)){
        return -1;
      }
      else{
        return 0;
      }
    })
    setAllPosts(postsLeastLiked)

   }
}

const schema = yup.object().shape({
  title: yup.string().required("You must have a title"),
  body: yup.string().required("You must have a body")
})

//get data from form (e.target.elements.<>.<>) and post to server
const onSubmit =  async (e) => {
  e.preventDefault()
  console.log(currentUsername)
  console.log(tagOptions)
  const data = {
      title: title,
      body: body,
      forums: tagOptions,
      username: currentUsername,
      post_timestamp: new Date()
  }
  const isValid = await schema.isValid(data)
  if(isValid){
      const response = await axios.post('http://localhost:3001/forumPostCreate', data)
      const postToAdd = response.data
      postToAdd.post_timestamp = new Date()
      setAllPosts([postToAdd, ...allPosts])
      setTitle("")
      setBody("")
      setTagOptions([])
  }
  else{
      alert("Make sure to give your post a title and body!")
  }
}

const handleTagDelete = (tagToRemove) =>{
  setTagOptions(tagOptions.filter(tag => tag !== tagToRemove))
}

const handleInputKeyDown = (e) =>{
  if(e.key === 'Enter' && tagInput.trim() != ''){
      e.preventDefault()
      setTagOptions([...tagOptions, tagInput])
      setTagInput('')
  }
}

return(<div>
  <form> 
          <label> Post Title </label>
          <input type="text" value={title} onChange= {(event) => {setTitle(event.target.value)}} name="title"/>
          <br></br>
          <label> Post Body </label>
          <input type="text"  value={body} onChange= {(event) => {setBody(event.target.value)}} name="body"/>
          <br>
          </br>
          <div>
           <label> Press "Enter" to create post tag(s) </label>
           <input type="text" value={tagInput} onChange={ (event) => {setTagInput(event.target.value)}} onKeyDown={handleInputKeyDown}/>
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

<h1>All Posts Feed</h1>

<form onSubmit={sortForumPosts}>
 <select onChange={(e) => setSortType(e.target.value)}>
    <option> Sort posts by... </option>
    <option value="1"> Newest to Oldest (default) </option>
    <option value="2"> Oldest To Newest </option>
    <option value="3"> Most Liked to Least Liked </option>
    <option value="4"> Least Liked to Most Liked </option>
 </select>
 <button> Sort </button>
</form>

<div className="feed-posts">
    {allPosts.map(post=>(
        <div className="user-posts" key={post.id}>
            <h2>{post.title} by {post.username} @ {new Date(post.post_timestamp).toLocaleString()}</h2>
            <p>{post.body}</p>
            <div>
              Tag(s)
              <br></br>
              {post.forums}
            </div>
            <button onClick={ () => navigate(`/forumPost/${post.id}/viewing/${currentUserID}/user`)}> View Post </button>
            <button 
                className={`like ${userLikedPosts.includes(post.id) ? "liked" : ""}`} 
                onClick={()=>handleLikeDislike(post.id, currentUserID, 1)}>
                {allPostLikes.get(post.id)} Likes
            </button>
            <button className={`dislike ${userDislikedPosts.includes(post.id) ? "disliked" : ""}`}
                onClick={()=>handleLikeDislike(post.id, currentUserID, 0)}>
                {allPostDislikes.get(post.id)} Dislikes</button>
        </div>
    ))}
</div>
</div>)
}