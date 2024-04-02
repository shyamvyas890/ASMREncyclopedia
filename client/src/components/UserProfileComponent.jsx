import { useEffect } from "react"
import { useState } from "react"
import axios from "axios"
import { useParams } from "react-router-dom"
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { useNavigate } from "react-router-dom";
import 'react-tabs/style/react-tabs.css';
import PostComponent from "./Post";
import LikeDislikeComponent from "./LikeDislikeComponent"

export const UserProfileComponent = () =>{
    const navigate = useNavigate()
    const {username} = useParams()
    const [userID, setUserID] = useState()
    const [forumPostComments, setForumPostComments] = useState([])
    const [videoPostComments, setVideoPostComments] = useState([])
    const [videoPosts, setVideoPosts] = useState([])
    const [forumPosts, setFourmPosts] = useState([])
    const [sortType, setSortType] = useState()
    const [allUser, setAllUser] = useState([])

    /*
    const [allPostLikes, setAllPostLikes] = useState(new Map())
    const [allPostDislikes, setAllPostDislikes] = useState(new Map())
    const [commentLikes, setCommentLikes] = useState()
    const [commentDislikes, setCommentDislikes] = useState()
    const [forumPostCommentID, setForumPostCommentID] = useState()
    */

    const sortAllUser = (e) =>{
      e.preventDefault()
      let copyOfAllPosts = [...allUser]
      //remove duplicate forum_post_comments from useEffect
      copyOfAllPosts = copyOfAllPosts.filter((obj, index, self) => 
        index === self.findIndex((t) => (
        t.timestamp === obj.timestamp
      ))
      )
      
       if(sortType === '1'){
        copyOfAllPosts.sort((a, b) => {
          if(a.timestamp > b.timestamp){
            return -1;
          }
          else if(a.timestamp < b.timestamp){
            return 1;
          }
          else{
            return 0;
          }
        })
       }
       //oldest to newest
       else if(sortType === '2'){
        console.log(copyOfAllPosts)
        copyOfAllPosts.sort((a, b) => {
          if(a.timestamp > b.timestamp){
            return 1;
          }
          else if(a.timestamp < b.timestamp){
            return -1;
          }
          else{
            return 0;
          }
        })
       }
       console.log("AFTER")
       console.log(copyOfAllPosts.length)
       setAllUser(copyOfAllPosts)
    }
    
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
   console.log("AFTER")
   console.log(copyOfAllPosts.length)
   setVideoPostComments(copyOfAllPosts)
}

   //gets the ID of the current user
   useEffect( () => {
    console.log("GETTING ID")
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
            const responseWithType = response.data.map(obj => ({
              ...obj, 
              type: "forum_post", 
              timestamp: obj.post_timestamp
            }))
            setFourmPosts(response.data)
            setAllUser(prevAllUser => prevAllUser.concat(responseWithType))
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
            setAllUser(prevAllUser => prevAllUser.concat(responseWithType))
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
        console.log("FETCHING COMMENTS")
        try{
            const response = await axios.get("http://localhost:3001/getForumPostComments", {
              params: {username, username}
            })
            const responseWithType = response.data.map(obj => ({
              ...obj, 
              type: "forum_post_comment", 
              timestamp: obj.comment_timestamp
            }))
            setForumPostComments(response.data)
            setAllUser(prevAllUser => prevAllUser.concat(responseWithType))
            const response2 = await axios.get("http://localhost:3001/getVideoPostComments", {
              params: {userID, userID}
            })
            const responseWithType2 = response2.data.map(obj => ({
              ...obj, 
              type: "video_post_comment", 
              timestamp: obj.CommentedAt
            }))
            setVideoPostComments(response2.data)
            setAllUser(prevAllUser => prevAllUser.concat(responseWithType2))
        }
        catch(error){
          console.log(error)
        }
     }
     fetchComments()
   }, [userID])

/*
const fetchAllPostsLikesAndDislikes = async () => {
  await LikeDislikeComponent.fetchAllPostsLikes(forumPosts, setAllPostLikes);
  await LikeDislikeComponent.fetchAllPostsDislikes(forumPosts, setAllPostDislikes);
};

const fetchAllCommentsLikesAndDislikes = async (commentID) => {
  await LikeDislikeComponent.fetchAllCommentsLikes(commentID, setCommentLikes);
  await LikeDislikeComponent.fetchAllCommentDislikes(commentID, setCommentDislikes);
};

   //get like/dislike information for posts and comments
   useEffect(() => {
    fetchAllPostsLikesAndDislikes();
  }, [forumPosts]);
*/
   return(
    <Tabs forceRenderTabPanel defaultIndex={0}>
    <TabList>
      <Tab> Overview </Tab>
      <Tab> Posts</Tab>
      <Tab> Comments </Tab>
    </TabList>

    <TabPanel>
  <div> 
    <form onSubmit={sortAllUser}>
      <select onChange={(e) => setSortType(e.target.value)}>
        <option value="none"> Sort everything by... </option>
        <option value="1"> Newest to Oldest </option>
        <option value="2"> Oldest To Newest </option>
      </select>
      <button type="submit"> Sort </button>
    </form>
    {console.log("INITIAL LENGTH")}
    {console.log(allUser.length)}
    {console.log(allUser)}
    {allUser.map((obj) => {
      if (obj.type === 'forum_post') {
        return (
          <div>
            <h2>{obj.title} by {obj.username} @ {new Date(obj.post_timestamp).toLocaleString()}</h2>
            <p>{obj.body}</p>
            <div>
              <div>
              Tags: {obj.tags && obj.tags.split(',').map(tag => ( //If tags!=null split tags
                <div>
                  <span key={tag ? tag.trim() : 'null'}>{tag ? tag.trim() : 'null'}</span>
                </div>
              ))}
              </div>
              
              <button onClick={() => navigate(`/forumPost/${obj.id}/viewing/${userID}/user`)}>
                View Post
              </button>
            </div>
            <br></br>
          </div>
        );
      } else if (obj.type === 'video_post') {
        return (
          <div> 
            <PostComponent 
              username={username} 
              title={obj.Title} 
              VideoLinkId={obj.VideoLinkId}
              VideoPostId={obj.VideoPostId}
              setVideoPostsAndRatings={null}
              timestamp={obj.PostedAt}
              totalLikes={null}
              totalDislikes={null}
            />
            <br></br>
          </div>
        );
      } else if (obj.type === 'forum_post_comment') {
        return (
          <div>
            {obj.username} commented @ {new Date(obj.comment_timestamp).toLocaleString()}: {obj.body}
           
            <button onClick={() => navigate(`/forumPost/${obj.forum_post_id}/viewing/${userID}/user`)}>
              View Post
            </button>
            <br></br>
          </div>
        );
      } else if (obj.type === 'video_post_comment') {
        return (
          <div>
            {username} commented @ {new Date(obj.CommentedAt).toLocaleString()}: {obj.Comment}
            <br></br>
          </div>
        );
      }
      return null; // Added to handle cases where obj.type doesn't match any condition
    })}
  </div>
</TabPanel>

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
                      <div>
                        Tags: {post.tags && post.tags.split(',').map(tag => ( //If tags!=null split tags
                          <div>
                            <span key={tag ? tag.trim() : 'null'}>{tag ? tag.trim() : 'null'}</span>
                          </div>
                        ))}
                      </div>
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
        
    <TabPanel> <div>
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

          </div></TabPanel>
      </Tabs>
    </TabPanel>

    <TabPanel>
      <Tabs forceRenderTabPanel>
        <TabList>
          <Tab> Forum Post Comments </Tab>
          <Tab> Video Post Comments </Tab>
        </TabList>

        <TabPanel> <form onSubmit={sortForumPostComments}>
                <select onChange={(e) => setSortType(e.target.value)}>
                    <option value="none"> Sort comments by... </option>
                    <option value="1"> Newest to Oldest </option>
                    <option value="2"> Oldest To Newest </option>
                </select>
                <button type="submit"> Sort </button>
        </form>
        {forumPostComments.length !== 0 ? (
    forumPostComments.map((comment) => {
    //fetchAllCommentsLikesAndDislikes(comment.id);
    return (
      <div key={comment.id}>
        {comment.username} commented @ {new Date(comment.comment_timestamp).toLocaleString()}: {comment.body} 

        <div>
         <button onClick={() => navigate(`/forumPost/${comment.forum_post_id}/viewing/${userID}/user`)}>
          View Post
         </button>
        </div>
        <br></br>
        
        
      </div>
    );
  })
) : (
  <div> User has not commented on Forum Posts </div>
)}

</TabPanel>
        <TabPanel> <form onSubmit={sortVideoPostComments}>
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
        {username} commented @ {new Date(comment.CommentedAt).toLocaleString()}: {comment.Comment}
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
