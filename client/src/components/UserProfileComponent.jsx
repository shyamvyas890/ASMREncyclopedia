import { useEffect } from "react"
import { useState } from "react"
import axios from "axios"
import { useParams } from "react-router-dom"
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { useNavigate } from "react-router-dom";
import 'react-tabs/style/react-tabs.css';
import PostComponent from "./Post";

export const UserProfileComponent = () =>{
    const navigate = useNavigate()
    const {username} = useParams()
    const [userID, setUserID] = useState()
    const [forumPostComments, setForumPostComments] = useState([])
    const [videoPostComments, setVideoPostComments] = useState([])
    const [videoPosts, setVideoPosts] = useState([])
    const [forumPosts, setFourmPosts] = useState([])
    const [sortType, setSortType] = useState()
    console.log("USERNAME: " + username)

/*
sort forumposts based off user choice 
sorting based on time uses post_timestamp attribute
sorting based on like - dislike count uses allPostLikes and allPostDislikes maps
*/
const sortForumPosts = (e) =>{
  e.preventDefault()
  const copyOfAllPosts = [...forumPosts]
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
   setFourmPosts(copyOfAllPosts)
}

/*
sort forumpostcomments based off user choice 
sorting based on time uses post_timestamp attribute
sorting based on like - dislike count uses allPostLikes and allPostDislikes maps
*/
const sortForumPostComments = (e) =>{
  e.preventDefault()
  const copyOfAllPosts = [...forumPostComments]
  //newest to oldest
   if(sortType === '1'){
    copyOfAllPosts.sort((a, b) => {
      if(a.comment_timestamp > b.comment_timestamp){
        return -1;
      }
      else if(a.comment_timestamp < b.comment_timestamp){
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
      if(a.comment_timestamp > b.comment_timestamp){
        console.log(a.post_timestamp);
        return 1;
      }
      else if(a.comment_timestamp < b.comment_timestamp){
        return -1;
      }
      else{
        return 0;
      }
    })
   }
   setForumPostComments(copyOfAllPosts)
}

/*
sort videoposts based off user choice 
sorting based on time uses post_timestamp attribute
sorting based on like - dislike count uses allPostLikes and allPostDislikes maps
*/
const sortVideoPosts = (e) =>{
  e.preventDefault()
  const copyOfAllPosts = [...videoPosts]
  //newest to oldest
   if(sortType === '1'){
    copyOfAllPosts.sort((a, b) => {
      if(a.PostedAt > b.PostedAt){
        return -1;
      }
      else if(a.PostedAt < b.PostedAt){
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
      if(a.PostedAt> b.PostedAt){
        console.log(a.post_timestamp);
        return 1;
      }
      else if(a.PostedAt < b.PostedAt){
        return -1;
      }
      else{
        return 0;
      }
    })
   }
   setVideoPosts(copyOfAllPosts)
  }

/*
sort forumpostcomments based off user choice 
sorting based on time uses post_timestamp attribute
sorting based on like - dislike count uses allPostLikes and allPostDislikes maps
*/
const sortVideoPostComments = (e) =>{
  e.preventDefault()
  const copyOfAllPosts = [...videoPostComments]
  //newest to oldest
   if(sortType === '1'){
    copyOfAllPosts.sort((a, b) => {
      if(a.CommentedAt > b.CommentedAt){
        return -1;
      }
      else if(a.comment_timestamp < b.comment_timestamp){
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
      if(a.commentedAt > b.commentedAt){
        return 1;
      }
      else if(a.commentedAt < b.commentedAt){
        return -1;
      }
      else{
        return 0;
      }
    })
   }
   setVideoPostComments(copyOfAllPosts)
}

   //gets the ID of the current user
   useEffect( () => {
    const fetchID = async () => {
        try {
          const response = await axios.get(`http://localhost:3001/users/id?username=${username}`);
          setUserID(response.data.id)
        } catch (error) {
          console.log(error);
        }
      };
    fetchID()
}, [username])

   //get all forumposts of the specified user
   useEffect( () =>{
    const fetchForumPosts = async () =>{
        try{
            const response = await axios.get("http://localhost:3001/UserPosts", {
                params: {username: username}
            })
            setFourmPosts(response.data)
        }
        catch(error){
            console.log(error)
        }
    }
    fetchForumPosts()
   }, [])

   useEffect( () =>{
    const fetchVideoPosts = async () =>{
        try{
            const response = await axios.get("http://localhost:3001/video-by-genre-or-user", {
                params: {UserId: userID}
            })
            setVideoPosts(response.data)
        }
        catch(error){
            console.log(error)
        }
    }
    fetchVideoPosts()
   }, [userID])

   useEffect( () =>{
     const fetchComments = async () =>{
        try{
            const response = await axios.get("http://localhost:3001/getForumPostComments", {
              params: {username, username}
            })
            setForumPostComments(response.data)
            const response2 = await axios.get("http://localhost:3001/getVideoPostComments", {
              params: {userID, userID}
            })
            setVideoPostComments(response2.data)
        }
        catch(error){
          console.log(error)
        }
     }
     fetchComments()
   }, [userID])

   return(
    <div>
       <Tabs>
        <TabList>
            <Tab> Forum Posts </Tab>
            <Tab> Video Posts </Tab>
            <Tab> Forum Post Comments </Tab>
            <Tab> Video Post Comments </Tab>
        </TabList>

        <TabPanel>
        <div>
    {forumPosts.length === 0 ? (
        <div> User has not made any Forum Posts </div>
    ) : (
        <>
            <form onSubmit={sortForumPosts}>
                <select onChange={(e) => setSortType(e.target.value)}>
                    <option value="none"> Sort posts by... </option>
                    <option value="1"> Newest to Oldest </option>
                    <option value="2"> Oldest To Newest </option>
                </select>
                <button type="submit"> Sort </button>
            </form>

            {forumPosts.map(post => (
                <div key={post.id}>
                    <h2>{post.title} by {post.username} @ {new Date(post.post_timestamp).toLocaleString()}</h2>
                    <p>{post.body}</p>
                    <div>
                        Tag(s)
                        <br></br>
                        {post.forums}
                        <br></br>
                        <button onClick={() => navigate(`/forumPost/${post.id}/viewing/${userID}/user`)}>
                            View Post
                        </button>
                    </div>
                </div>
            ))}
        </>
    )}
</div>

        </TabPanel>

        <TabPanel>
          <div>
          <div>
    {videoPosts.length === 0 ? (
        <div> User has not made any Video Posts </div>
    ) : (
        <>
            <form onSubmit={sortVideoPosts}>
                <select onChange={(e) => setSortType(e.target.value)}>
                    <option value="none"> Sort posts by... </option>
                    <option value="1"> Newest to Oldest </option>
                    <option value="2"> Oldest To Newest </option>
                </select>
                <button type="submit"> Sort </button>
            </form>
            {videoPosts.map((video, index) => (
                <div key={index}> 
                    <PostComponent 
                        username={username} 
                        title={video.Title} 
                        VideoLinkId={video.VideoLinkId}
                        VideoPostId={video.VideoPostId}
                        setVideoPostsAndRatings={null}
                        timestamp={video.PostedAt}
                        totalLikes={null}
                        totalDislikes={null}
                    />
                </div>
            ))}
        </>
    )}
</div>

          </div>
        </TabPanel>

        <TabPanel>
        <form onSubmit={sortForumPostComments}>
                <select onChange={(e) => setSortType(e.target.value)}>
                    <option value="none"> Sort comments by... </option>
                    <option value="1"> Newest to Oldest </option>
                    <option value="2"> Oldest To Newest </option>
                </select>
                <button type="submit"> Sort </button>
        </form>
  {forumPostComments.length !== 0 ? (
    forumPostComments.map((comment) => (
      <div key={comment.id}>
        {comment.username} commented @ {new Date(comment.comment_timestamp).toLocaleString()}: {comment.body}
              
        <button onClick={() => navigate(`/forumPost/${comment.forum_post_id}/viewing/${userID}/user`)}>
                            View Post
        </button>
      </div>
    ))
  ) : (
    <div> User has not commented on Forum Posts </div>
  )}
</TabPanel>

      <TabPanel>
      <form onSubmit={sortVideoPostComments}>
                <select onChange={(e) => setSortType(e.target.value)}>
                    <option value="none"> Sort comments by... </option>
                    <option value="1"> Newest to Oldest </option>
                    <option value="2"> Oldest To Newest </option>
                </select>
                <button type="submit"> Sort </button>
        </form>
      {videoPostComments.length !== 0 ? (
    videoPostComments.map((comment) => (
      <div>
        {username} commented @ {new Date(comment.commented_at).toLocaleString()}: {comment.comment}
      </div>
    ))
  ) : (
    <div> User has not commented on Video Posts </div>
  )}
      </TabPanel>

       </Tabs>

    </div>
   )
 }

