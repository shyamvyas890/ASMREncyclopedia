import React, { useState } from 'react';
import LoginComponent from './Login';
const HomeComponent= () => {
    const [username, setUsername] = useState('');
    const [isLoggedIn, setIsLoggedIn]= useState(false);
    return (
        <div>
            <LoginComponent 
            username= {username}
            setUsername= {setUsername}
            isLoggedIn={isLoggedIn}
            setIsLoggedIn={setIsLoggedIn}
            />
            {isLoggedIn ? (
           
            <p>Feed</p>
            
            ) : null}
        </div>
        


    )
}

export default HomeComponent;

