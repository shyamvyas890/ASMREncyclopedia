import React from 'react';
import { useEffect } from 'react'
import { useState } from 'react'
import axios from '../utils/AxiosWithCredentials';

const ForumComponent= () => {
    const [forums, setForums] = useState([]);

    useEffect(()=>{
        const fetchAllForums = async ()=>{
            try{
                const res = await axios.get("http://localhost:3001/forums")
                setForums(res.data);
                console.log(res)
            }catch(err){
                console.log(err)
            }
        } 
        fetchAllForums()
    }, [])
    
    return <div>
                <h1>Forums</h1>
                <div className="forums">
                    {forums.map(forum=>(
                        <div className="forum" key={forum.id}>
                            <h2>{forum.title}</h2>
                            <p>{forum.description}</p>
                        </div>
                    ))}
                </div>
            </div>
};

export default ForumComponent;