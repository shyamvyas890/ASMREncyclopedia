import axios from '../utils/AxiosWithCredentials';
import { useState, useEffect } from "react";

export const UserPostsComponent = (props) =>{

    const [UserPosts, setUserPosts] = useState([])

    //get all user posts for creating a post
    useEffect(()=>{
        const FetchAllUserPosts = async ()=>{
            try{
                const res = await axios.get("http://localhost:3001/UserPosts", { params: { username: props.username } })
                setUserPosts(res.data);
            }catch(err){
                console.log(err)
            }
        } 
        FetchAllUserPosts()
    }, [])

    const handleDelete = async (id)=>{
        try{
            await axios.delete("http://localhost:3001/forumPost/"+id)
        }catch(err){
            console.log(err)
        }
    }

    return <div>
    <h1>My Posts</h1>
    <div className="user-posts">
        {UserPosts.map(UserPost=>(
            <div className="user-posts" key={UserPost.id}>
                <h2>{UserPost.title}</h2>
                <p>{UserPost.body}</p>
                <p> {UserPost.post_timestamp}</p>
                <button className="delete" onClick={()=>handleDelete(UserPost.id)}>Delete</button>
            </div>
        ))}
    </div>
</div>
};
export default UserPostsComponent