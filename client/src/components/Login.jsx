// LoginComponent.js
import React, { useState } from 'react';
import axios from 'axios';

const LoginComponent = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn]= useState(false);
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:3001/login', {
        username,
        password
      });

      console.log('Login successful. Token:', response.data.token);
      localStorage.setItem("token", response.data.token);
      setIsLoggedIn(true);

      // You may want to store the token in state or local storage for authentication
    } catch (error) {
      console.log('Login error:', error);
    }
  };

  const tokenVerify= async (e) => {

    const theToken= localStorage.getItem("token");
    if(theToken){
        try{
            const response= await axios.get(`http://localhost:3001/verify-token/${theToken}`)
            console.log(response);
            if(response.data.username){
                setUsername(response.data.username)
                setIsLoggedIn(true);
            }
            else {
                setIsLoggedIn(false);
            }
        }

        catch(error){
            console.log(error);
        }
    }
    else{
        setIsLoggedIn(false);
    }

  }

  React.useEffect(()=>{
    tokenVerify();
    
  }, []);

  const handleLogout = async (e) => {
    await axios.post(`http://localhost:3001/logout/${localStorage.getItem("token")}`);
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUsername("");
    setPassword("");
  }

  return (
    <div>
        {isLoggedIn?(
            <div>
            <h1>Welcome, {username}</h1>
            <button onClick={handleLogout}>Logout</button>
            </div>

        ) : (<div>
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
            <label>
            Username:
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
            </label>
            <br />
            <label>
            Password:
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
            <br />
            <button type="submit">Login</button>
        </form>
        </div>)
        }

    </div>
  );
};

export default LoginComponent;
