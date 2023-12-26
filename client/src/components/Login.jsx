// LoginComponent.js
import React, { useState } from 'react';
import axios from 'axios';

const LoginComponent = (props) => {
  const [password, setPassword] = useState('');
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/login', {
        username:props.username,
        password
      });
      console.log('Login successful. Token:', response.data.token);
      localStorage.setItem("token", response.data.token);
      props.setIsLoggedIn(true);

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
                props.setUsername(response.data.username)
                props.setIsLoggedIn(true);
            }
            else {
                props.setIsLoggedIn(false);
            }
        }

        catch(error){
            console.log(error);
        }
    }
    else{
        props.setIsLoggedIn(false);
    }
  }

  React.useEffect(()=>{
    tokenVerify();
  }, []);

  const handleLogout = async (e) => {
    await axios.post(`http://localhost:3001/logout/${localStorage.getItem("token")}`);
    localStorage.removeItem("token");
    props.setIsLoggedIn(false);
    props.setUsername("");
    setPassword("");
  }

  return (
    <div>
        {props.isLoggedIn?(
            <div>
            <h1>Welcome, {props.username}!</h1>
            <button onClick={handleLogout}>Logout</button>
            </div>

        ) : (<div>
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
            <label>
            Username:
            <input type="text" value={props.username} onChange={(e) => props.setUsername(e.target.value)} />
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
