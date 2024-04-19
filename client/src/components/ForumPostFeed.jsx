import axios from '../utils/AxiosWithCredentials';
import { useState, useEffect } from "react";
import { redirectDocument, useNavigate } from "react-router-dom";
import LikeDislikeComponent from "./LikeDislikeComponent"
import * as yup from "yup"
import ForumPostFeedCSS from "../css/forumpostfeed.module.css"
import '../index.css';
import NavigationComponent from './Navigation';

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
        const fetchUsername = async () => {
            try {
              const response = await axios.get(`http://localhost:3001/verify-token`);
              setCurrentUsername(response.data.username);
            } catch (error) {
              //window.alert("You must be logged in")
              navigate("/")
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
      fetchAllPosts()
    }, [])

    const fetchAllPosts = async ()=>{
      try{
        const only = await axios.get("http://localhost:3001/fetchForumSubscriptionOnly")
        const sub = await axios.get("http://localhost:3001/fetchForumSubscriptions")
        const res = await axios.get("http://localhost:3001/forumPostsAll")
        let arr = []
        if(only.data.length !== 0 && sub.data.length !== 0){   //If there is a preference
          const subTags = sub.data.map(tag => tag.ForumTagName);
          for(const post of res.data){
            if(post.tags){
              const postTags = post.tags.split(",")
              const taggedPost = subTags.some(subTag => postTags.includes(subTag)) // If includes at least one tag
              if(taggedPost && only.data[0].Only == 1){   //If Only and tags match, add to arr
                arr.push(post)
              } else if(!taggedPost && only.data[0].Only == 0){  //If !Only (Except) and no tags match, add to arr
                arr.push(post)
              }
            } else {  //If post has no tags push either way
              arr.push(post)
            }
          }
        } else {    //No Preference
          for(const post of res.data){
            arr.push(post)
          }
        }
          //initially sort from newest to oldest
          setAllPosts(arr)
          console.log(arr)
          const intialPosts = arr.sort((a, b) => {
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
      } catch(err){
          console.log(err)
      }
    } 

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
      username: currentUsername,
      post_timestamp: new Date(),
      allPosts: allPosts
  }
  const isValid = await schema.isValid(data) //valid schema according to yup
  if(isValid){
    try{
      //Create Forum Post
      const postRes = await axios.post('http://localhost:3001/forumPostCreate', data) //post to database
      let tagIDs = []
      for(let i = 0; i < tagOptions.length; i++){
        let forumTagName = tagOptions[i]
        //Create Tags submitted with Forum Post
        await axios.post('http://localhost:3001/forumTagCreate', {}, {
          params: { forumTagName: forumTagName }
        })
        //Gets the TagID of each Tag
        const tagRes = await axios.get('http://localhost:3001/fetchForumTag', {
          params: {forumTagName: forumTagName}
        })
        tagIDs.push(tagRes.data[0])
      }

      for(let forumTagID of tagIDs){
        //Creates a TagPost, linking Tags to Posts
        await axios.post('http://localhost:3001/forumPostTagCreate', {}, {
          params: { postID: postRes.data.id, forumTagID: forumTagID.ForumTagID }
        })
      }

      //get all posts including new post, resort from newest to oldest
      fetchAllPosts()
      //resetting useStates and text boxes
      setTitle("")
      setBody("")
      setTagOptions([])
    } catch (e){
        console.log(e)
    }
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


 return(


  <div>
    <NavigationComponent />
    <div className={ForumPostFeedCSS['container']}> 
      <form className={ForumPostFeedCSS['forum-post-form']}>
        <input className={ForumPostFeedCSS['forum-post-form-title']} id="forum-post-title" type="text" placeholder="Title" value={title} onChange={(event) => {setTitle(event.target.value)}} name="title"/>
        <br />
        <textarea className={ForumPostFeedCSS['forum-post-form-body']} type="text" value={body} placeholder="Body" onChange={(event) => {setBody(event.target.value)}} name="body"/>
        <br />
        <input className={ForumPostFeedCSS['forum-post-form-tag']} placeholder="Press 'Enter' to create tag(s)" type="text" value={tagInput} onChange={(event) => {setTagInput(event.target.value)}} onKeyDown={handleInputKeyDown}/>
         <div className={ForumPostFeedCSS["tag-container"]}>
          {tagOptions.map((tag) => (
            <div key={tag}>
              {tag}
              <button className={ForumPostFeedCSS["tag-button"]} onClick={() => handleTagDelete(tag)}> x </button>
            </div>
          ))}
         </div>

        <button className={ForumPostFeedCSS["forum-post-button"]} onClick={onSubmit}> Post </button>
      </form>
    </div>
    

  <form className={ForumPostFeedCSS["forum-post-sort-form"]} onSubmit={sortForumPosts}>
    <select className={ForumPostFeedCSS['forum-post-form-select']} onChange ={(e) => setSortType(e.target.value)}>
      <option value="none"> Sort by... </option>
      <option value="1"> Newest to Oldest (default) </option>
      <option value="2"> Oldest To Newest </option>
      <option value="3"> Most Liked to Least Liked </option>
      <option value="4"> Least Liked to Most Liked </option>
    </select>
    <button className={ForumPostFeedCSS["forum-post-sort-button"]}> Sort </button>
  </form>


  <div className={ForumPostFeedCSS["feed-posts"]}>
    {allPosts.map(post=>(
      <div className={ForumPostFeedCSS["user-posts"]} key={post.id}>
        <h2> <a 
          style={{textDecoration: 'none'}}
          onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
          onMouseOut={(e) => e.target.style.textDecoration = 'none'}
          onClick={() => {navigate(`/username/${post.username}`)}}
          >
          {post.username}
        </a> 
        ◦ {new Date(post.post_timestamp).toLocaleString()}</h2>
        <h4 style={{fontWeight: "bold"}}> {post.title} </h4>

        <p>{post.body}</p>
        <div>
          Tag(s) {post.tags && post.tags.split(',').map(tag => ( //If tags!=null split tags
            <div key={tag ? tag.trim() : 'null'}>
              <span>{tag ? tag.trim() : 'null'}</span>
            </div>
          ))}
        </div>
        <button onClick={() => navigate(`/forumPost/${post.id}/viewing/${currentUserID}/user`)} style={{backgroundColor: "#3B9EBF", marginRight: "5px"}}> View Post </button>
        <button className={`like ${userLikedPosts.includes(post.id) ? "liked" : ""}`} onClick={() => handlePostLikeDislike(post.id, currentUserID, 1)}>
          {allPostLikes.get(post.id)} Likes
        </button>
        <button className={`dislike ${userDislikedPosts.includes(post.id) ? "disliked" : ""}`} onClick={() => handlePostLikeDislike(post.id, currentUserID, 0)}>
          {allPostDislikes.get(post.id)} Dislikes
        </button>
      </div>
    ))}
  </div>
</div>


 )


}