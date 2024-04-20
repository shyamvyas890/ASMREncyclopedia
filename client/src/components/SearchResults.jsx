import axiosWithCredentials from "../utils/AxiosWithCredentials"
import NavigationComponent from "./Navigation"
import SearchResultsCSS from "../css/searchresults.module.css"
import { useNavigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import PostComponent from "./Post"
export const SearchComponent = () =>{
  const searchTerm = useParams()
  const navigate = useNavigate()
  const [allResults, setAllResults] = useState([])
  const [userID, setUserID] = useState()

  useEffect( () =>{
    const tokenVerify= async (e) => {
        try{
            const response= await axiosWithCredentials.get(`http://localhost:3001/verify-token`)
            setUserID(response.data.UserId)
        }
        catch(error){
          console.log(error)
        }
      
    }
    tokenVerify()
  }, [])

  useEffect( () =>{
    const fetchForumPosts = async () =>{
        try{
            const response = await axiosWithCredentials.get(`http://localhost:3001/forumPostSearch/${searchTerm.searchTerm}`)
            const responseWithType = response.data.map(obj => ({
              ...obj, 
              type: "forum_post", 
              timestamp: obj.post_timestamp
            }))
            setAllResults(prevAllResults => prevAllResults.concat(responseWithType))
        }
        catch(error){
            console.log(error)
        }
    }
    fetchForumPosts()
   }, [])


   useEffect( () =>{
    const fetchVideoPosts = async () =>{
        try {
            const response = await axiosWithCredentials.get(`http://localhost:3001/videoPostSearch/${searchTerm.searchTerm}`);
            
            const responseWithType = await Promise.all(response.data.map(async obj => {
                const usernameResponse = await axiosWithCredentials.get("http://localhost:3001/users/id", {
                    params: { UserId: obj.UserId }
                });
                
                const username = usernameResponse.data.username;
                obj.username = username;
                obj.type = "video_post";
                obj.timestamp = obj.PostedAt;
                
                return obj;
            }));
            
            setAllResults(prevAllResults => prevAllResults.concat(responseWithType));
        } catch (error) {
            console.error("Error:", error);
        }
    }
    fetchVideoPosts()
   }, [])

  return(
    <div>
        <div>
            <NavigationComponent />
        </div>

        <h3 style={{ fontWeight: "bold", fontSize: "40px", marginTop:"20px"}}>Search results for "{searchTerm.searchTerm}"</h3>
        {allResults.length === 0 &&
             <div style={{ fontWeight: "bold", fontSize: "30px", marginTop:"20px"}}>
               <h4>No results found</h4>
             </div> 
           }
        <div className="search-results"> 
            {console.log(allResults.length)}
           {allResults.map((obj) => {
             if(obj.type === 'forum_post'){
                return(
                    <div className={SearchResultsCSS['user-posts']}>
                       <h2> <a 
                       style={{textDecoration: 'none'}}
                       onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                       onMouseOut={(e) => e.target.style.textDecoration = 'none'}
                       onClick={() => {navigate(`/username/${obj.username}`)}}
                       >
                      {obj.username}
                      </a> 
                      ◦ {new Date(obj.post_timestamp).toLocaleString()}</h2>
                      <h4 style={{fontWeight: "bold"}}> {obj.title} </h4>
                      <p>{obj.body}</p>
                      <button onClick={() => navigate(`/forumPost/${obj.id}/viewing/${userID}/user`)} style={{backgroundColor: "#3B9EBF", marginRight: "5px", border: "none", borderRadius: "25px", color: "#FFF"}}> View Post </button>
                    </div>
                )
             }
             else{
                return(
                    <div className={SearchResultsCSS['video-post']}>
                       <PostComponent 
                        username={obj.username} 
                        title={obj.Title} 
                        VideoLinkId={obj.VideoLinkId}
                        VideoPostId={obj.VideoPostId}
                        setVideoPostsAndRatings={null}
                        timestamp={obj.timestamp}
                        totalLikes={null}
                        totaDislikes={null}
                    />   
                    </div>
                )
             }
           })}
        </div>

    </div>
  )
}