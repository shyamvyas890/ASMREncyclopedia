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
    const [searchInput, setSearchInput] = useState()

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

    //get all forumposts upon page load, initially sort from newest to oldest 
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
}, [currentUserID]);

const fetchAllPostsLikesAndDislikes = async () => {
    await LikeDislikeComponent.fetchAllPostsLikes(allPosts, setAllPostLikes);
    await LikeDislikeComponent.fetchAllPostsDislikes(allPosts, setAllPostDislikes);
    await LikeDislikeComponent.fetchUserLikedPosts(currentUserID, allPosts, setUserLikedPosts);
    await LikeDislikeComponent.fetchUserDislikedPosts(currentUserID, allPosts, setUserDislikedPosts);
};

const handlePostLikeDislike = async (postID, userID, rating) => {
    await LikeDislikeComponent.handleForumPostLikeDislike(postID, userID, rating);
    //updates the likes/dislikes
    fetchAllPostsLikesAndDislikes();
}

/*
sort forumposts based off user choice 
sorting based on time uses post_timestamp attribute
sorting based on like - dislike count uses allPostLikes and allPostDislikes maps
*/
const sortForumPosts = (e) =>{
  e.preventDefault()
  const copyOfAllPosts = [...allPosts]
  //newest to oldest
   if(sortType === '1'){
    copyOfAllPosts.sort((a, b) => {
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
   }
   //oldest to newest
   else if(sortType === '2'){
    copyOfAllPosts.sort((a, b) => {
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
   }
   //highest like - dislike count
   else if(sortType === '3'){
      copyOfAllPosts.sort( (a, b) =>{
        if(allPostLikes.get(a.id) - allPostDislikes.get(a.id) > allPostLikes.get(b.id) - allPostDislikes.get(b.id)){
          return -1;
        }
        else if(allPostLikes.get(a.id) - allPostDislikes.get(a.id) < allPostLikes.get(b.id) - allPostDislikes.get(b.id)){
          return 1;
        }
        else{
          return 0;
        }
      })
   }
   //lowest like - dislike count
   else if(sortType === '4'){
    copyOfAllPosts.sort( (a, b) =>{
      if(allPostLikes.get(a.id) - allPostDislikes.get(a.id) > allPostLikes.get(b.id) - allPostDislikes.get(b.id)){
        return 1;
      }
      else if(allPostLikes.get(a.id) - allPostDislikes.get(a.id) < allPostLikes.get(b.id) - allPostDislikes.get(b.id)){
        return -1;
      }
      else{
        return 0;
      }
    })
   }
   setAllPosts(copyOfAllPosts)
}

//form schema to ensure users enter a post title and body
const schema = yup.object().shape({
  title: yup.string().required("You must have a title"),
  body: yup.string().required("You must have a body")
})

/*
handles forum post submission
posts data to server, then resorts the posts from newest to oldest for displaying
*/
const onSubmit =  async (e) => {
  e.preventDefault()
  //form data from useStates for the server
  const data = {
      title: title,
      body: body,
      forums: tagOptions,
      username: currentUsername,
      post_timestamp: new Date(),
      allPosts: allPosts
  }
  const isValid = await schema.isValid(data) //valid schema according to yup
  if(isValid){
      
      await axios.post('http://localhost:3001/forumPostCreate', data) //post to database
      //get all posts including new post, resort from newest to oldest
      const response2 = await axios.get('http://localhost:3001/forumPostsAll') 
      response2.data.sort((a, b) => {
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
      setAllPosts(response2.data)

      //resetting useStates and text boxes
      setTitle("")
      setBody("")
      setTagOptions([])
  }
  else{
      alert("Make sure to give your post a title and body!")
  }
}

//user removes a tag from their post
const handleTagDelete = (tagToRemove) =>{
  setTagOptions(tagOptions.filter(tag => tag !== tagToRemove))
}

//user submits a tag for their post
const handleInputKeyDown = (e) =>{
  if(e.key === 'Enter' && tagInput.trim() != '' ){
      //tag not yet included
      if(!tagOptions.includes(tagInput)){
        e.preventDefault()
        setTagOptions([...tagOptions, tagInput])
        setTagInput('')
      }
      //trying to submit a duplicate tag
      else{
        e.preventDefault()
        console.log("TAGS: " + tagOptions)
        alert(`You already included the tag '${tagInput}'`)
        setTagInput('')
        console.log("TAGS: " + tagOptions)
      }
  }
}

const searchForumPosts = () =>{
   navigate(`/forumPost/search_by/${searchInput}`)
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
                <div key={tag}>
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
    <option value="none"> Sort posts by... </option>
    <option value="1"> Newest to Oldest (default) </option>
    <option value="2"> Oldest To Newest </option>
    <option value="3"> Most Liked to Least Liked </option>
    <option value="4"> Least Liked to Most Liked </option>
 </select>
 <button> Sort </button>
</form>

<form onSubmit={searchForumPosts}>
  <input value={searchInput} type="text" placeholder="Search posts by title..." onChange={ (e) => setSearchInput(e.target.value)}/>
  <button> Search </button>
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
                onClick={()=>handlePostLikeDislike(post.id, currentUserID, 1)}>
                {allPostLikes.get(post.id)} Likes
            </button>
            <button className={`dislike ${userDislikedPosts.includes(post.id) ? "disliked" : ""}`}
                onClick={()=>handlePostLikeDislike(post.id, currentUserID, 0)}>
                {allPostDislikes.get(post.id)} Dislikes</button>
        </div>
    ))}
</div>
</div>)
}