import { useEffect } from "react"
import { useState } from "react"
import axios from '../utils/AxiosWithCredentials';
import { useParams } from "react-router-dom"
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { useNavigate } from "react-router-dom";
import 'react-tabs/style/react-tabs.css';
import PostComponent from "./Post";

export const UserProfileComponent = () =>{
    const navigate = useNavigate()
    const {ProfileUsername} = useParams()
    console.log("VIEWING PROFILE OF " + ProfileUsername)
    const [userID, setUserID] = useState()
    const [forumPostComments, setForumPostComments] = useState([])
    const [videoPostComments, setVideoPostComments] = useState([])
    const [videoPosts, setVideoPosts] = useState([])
    const [forumPosts, setFourmPosts] = useState([])
    const [sortType, setSortType] = useState()
    

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

const sortVideoPostComments = (e) =>{
  e.preventDefault()
  const copyOfAllPosts = [...videoPostComments]
  console.log("START SOTRING")
  //newest to oldest
   if(sortType === '1'){
    copyOfAllPosts.sort((a, b) => {
      if(a.CommentedAt > b.CommentedAt){
        return -1;
      }
      else if(a.CommentedAt < b.CommentedAt){
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
      if(a.commentedAt < b.commentedAt){
        return -1;
      }
      else if(a.commentedAt > b.commentedAt){
        return 1;
      }
      else{
        return 0;
      }
    })
   }
   console.log("AFTER")
   console.log(copyOfAllPosts.length)
   setVideoPostComments(copyOfAllPosts)
}

   //gets the ID of the current user
   useEffect( () => {
    const fetchID = async () => {
        try {
          const response = await axios.get(`http://localhost:3001/users/id?username=${ProfileUsername}`);
          setUserID(response.data.id)
        } catch (error) {
          console.log(error);
        }
      };
    fetchID()
}, [ProfileUsername])

   //get all forumposts of the specified user
   useEffect( () =>{
    const fetchForumPosts = async () =>{
        try{
            const response = await axios.get("http://localhost:3001/forumPostByUsername", {
                params: {username: ProfileUsername}
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
            const responseWithType = response.data.map(obj => ({
              ...obj, 
              type: "video_post", 
              timestamp: obj.PostedAt
            }))
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
              params: {username: ProfileUsername}
            })
            const responseWithType = response.data.map(obj => ({
              ...obj, 
              type: "forum_post_comment", 
              timestamp: obj.comment_timestamp
            }))
            setForumPostComments(response.data)
            const response2 = await axios.get("http://localhost:3001/getVideoPostComments", {
              params: {userID, userID}
            })
            const responseWithType2 = response2.data.map(obj => ({
              ...obj, 
              type: "video_post_comment", 
              timestamp: obj.CommentedAt
            }))
            setVideoPostComments(response2.data)
        }
        catch(error){
          console.log(error)
        }
     }
     fetchComments()
   }, [userID])

   return(
    <Tabs forceRenderTabPanel defaultIndex={0} style={{marginTop: "20px"}}>
    <TabList>
      <Tab> Posts</Tab>
      <Tab> Comments </Tab>
    </TabList>

    <TabPanel>
      <Tabs forceRenderTabPanel>
        <TabList>
          <Tab> Forum Posts </Tab>
          <Tab> Video Posts </Tab>
        </TabList>

        <TabPanel> <div>
    {forumPosts.length === 0 ? (
        <div> User has not made any Forum Posts </div>
    ) : (
        <>
            <form onSubmit={sortForumPosts}>
                <select style={{padding: "8px", backgroundColor: "#333", border: "none", color: "#fff"}} onChange={(e) => setSortType(e.target.value)}>
                    <option value="none"> Sort by... </option>
                    <option value="1"> Newest to Oldest (Default) </option>
                    <option value="2"> Oldest To Newest </option>
                </select>
                <button className="btn btn-primary" style={{marginLeft: "10px"}} type="submit"> Sort </button>
            </form>

            {forumPosts.map(post => (
                <div key={post.id} style={{marginTop: "20px", backgroundColor: "#333",
                 padding: "20px",
                 marginBottom: "20px", width: "60%"}}>
                    <h2>{post.username} ◦ {new Date(post.post_timestamp).toLocaleString()}</h2>
                    <h4 style={{fontWeight: "bold"}}> {post.title}</h4>
                    <p>{post.body}</p>
                    <div>
                      <div>
                        Tags: {post.tags && post.tags.split(',').map(tag => ( //If tags!=null split tags
                          <div>
                            <span key={tag ? tag.trim() : 'null'}>{tag ? tag.trim() : 'null'}</span>
                          </div>
                        ))}
                      </div>
                    <button className="btn btn-primary" style={{marginTop: "10px"}} onClick={() => navigate(`/forumPost/${post.id}/viewing/${userID}/user`)}>
                        View Post
                    </button>
                    </div>
                </div>
            ))}
        </>
    )} 
    </div> 
    </TabPanel>
        
    <TabPanel> <div>
          <div>
    {videoPosts.length === 0 ? (
        <div> User has not made any Video Posts </div>
    ) : (
        <>
            <form onSubmit={sortVideoPosts}>
                <select style={{padding: "8px", backgroundColor: "#333", border: "none", color: "#fff"}} onChange={(e) => setSortType(e.target.value)}>
                    <option value="none"> Sort by... </option>
                    <option value="1"> Newest to Oldest </option>
                    <option value="2"> Oldest To Newest </option>
                </select>
                <button className="btn btn-primary" style={{marginLeft: "10px"}} type="submit"> Sort </button>
            </form>
            {videoPosts.map((video, index) => (
                <div key={index}> 
                    <PostComponent 
                        username={ProfileUsername} 
                        title={video.Title} 
                        VideoLinkId={video.VideoLinkId}
                        VideoPostId={video.VideoPostId}
                        setVideoPostsAndRatings={null}
                        timestamp={video.PostedAt}
                        totalLikes={null}
                        totaDislikes={null}
                    />
                </div>
            ))}
        </>
    )}
</div>

          </div></TabPanel>
      </Tabs>
    </TabPanel>

    <TabPanel>
      <Tabs forceRenderTabPanel>
        <TabList>
          <Tab> Forum Post Comments </Tab>
          <Tab> Video Post Comments </Tab>
        </TabList>

        <TabPanel> <form onSubmit={sortForumPostComments} >
                <select onChange={(e) => setSortType(e.target.value)} style={{padding: "8px", backgroundColor: "#333", border: "none", color: "#fff"}}>
                    <option value="none"> Sort by...</option>
                    <option value="2"> Oldest To Newest (Default) </option>
                    <option value="1">  Newest to Oldest </option>
                </select>
                <button className="btn btn-primary" style={{marginLeft: "10px"}} type="submit"> Sort </button>
        </form>
        {forumPostComments.length !== 0 ? (

    forumPostComments.map((comment) => {
    return (
      <div key={comment.id} style={{marginTop: "20px"}}>
        <a 
          style={{textDecoration: 'none'}}
          onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
          onMouseOut={(e) => e.target.style.textDecoration = 'none'}
          onClick={() => {navigate(`/username/${comment.username}`)}}
          >
          {comment.username}
         </a>  ◦ {new Date(comment.comment_timestamp).toLocaleString()} <br></br> {comment.body}
         <br></br>
         <button onClick={() => navigate(`/forumPost/${comment.forum_post_id}/viewing/${userID}/user`)} className="btn btn-primary" > View Post </button>
      </div>
    );
  })
) : (
  <div> User has not commented on Forum Posts </div>
)}

</TabPanel>
        <TabPanel> <form onSubmit={sortVideoPostComments}>
                <select style={{padding: "8px", backgroundColor: "#333", border: "none", color: "#fff"}} onChange={(e) => setSortType(e.target.value)}>
                    <option value="none"> Sort by... </option>
                    <option value="2"> Oldeset to Newest (Default) </option>
                    <option value="1"> Newest to Oldest </option>
                </select>
                <button className="btn btn-primary" style={{marginLeft: "10px"}} type="submit"> Sort </button>
        </form>
      {videoPostComments.length !== 0 ? (
    videoPostComments.map((comment) => (
      <div>
        {!comment.DELETED && <div style={{marginTop: "20px"}}>
        <a 
              style={{textDecoration: 'none'}}
              onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
              onMouseOut={(e) => e.target.style.textDecoration = 'none'}
              onClick={() => {navigate(`/username/${ProfileUsername}`)}}
              >
              {ProfileUsername}
              </a> ◦ {new Date(comment.CommentedAt).toLocaleString()} <br></br> {comment.Comment} 
              <br></br>
           <button className="btn btn-primary" onClick={() => navigate(`/video/${comment.VideoPostId}`)}>
             View Post
           </button>
      </div>}

      </div>
    ))
  ) : (
    <div> User has not commented on Video Posts </div>
  )} </TabPanel>
      </Tabs>
    </TabPanel>
  </Tabs>
   )
}
