// LoginComponent.js
import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
const LoginComponent = (props) => {
  const [feedback, setFeedback]= useState("");
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/login', {
        username:props.username,
        password:e.target.elements.passwordInput.value
      });
      e.target.elements.passwordInput.value="";
      setFeedback("Login Successful");
      localStorage.setItem("token", response.data.token);
      props.setIsLoggedIn(true);
    } catch (error) {
      setFeedback(error.response.data);
      e.target.elements.passwordInput.value="";
      props.setUsername("");

    }
  };
  const tokenVerify= async (e) => {
    const theToken= localStorage.getItem("token");
    if(theToken){
        try{
            const response= await axios.get(`http://localhost:3001/verify-token/${theToken}`)
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
    setFeedback('');
  }

  return (
    <div>
        {props.isLoggedIn?(
            <div>
            <h1>Welcome, {props.username}!</h1>
            <button onClick={handleLogout}>Logout</button>
            </div>

        ) :props.isLoggedIn===false? (<div>
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
            <label>
            Username:
            <input type="text" value={props.username} onChange={(e) => props.setUsername(e.target.value)} />
            </label>
            <br />
            <label>
            Password:
            <input type="password" name="passwordInput"/>
            </label>
            <br />
            <button type="submit">Login</button>
        </form>
        <div>Don't have an account? <Link to="/register">Register here!</Link></div>
        {feedback && (feedback==="Your password is incorrect." || feedback==="This username does not exist." || feedback==="Error logging in.") && <p style={{color:'red'}}>{feedback}</p>}
        {feedback && feedback ==="Login Successful" && <p style={{color:'green'}}>{feedback}</p>}
        </div>):null
        }

    </div>
  );
};
export default LoginComponent;
