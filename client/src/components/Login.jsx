import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../utils/AxiosWithCredentials';
const LoginComponent = (props) => {
  const [feedback, setFeedback]= useState("");
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/login', {
        username:props.username,
        password:e.target.elements.passwordInput.value
      });
      console.log(response)
      e.target.elements.passwordInput.value="";
      setFeedback("Login Successful");
      localStorage.setItem("token", response.data.token);
      props.setIsLoggedIn(true);
      window.location.reload();
    } catch (error) {
      setFeedback(error.response.data);
      e.target.elements.passwordInput.value="";
      props.setUsername("");

    }
  };
  const tokenVerify= async (e) => {
      try{
          const response= await axios.get(`http://localhost:3001/verify-token`)
          if(response.data.username){
              props.setUsername(response.data.username)
              props.setIsLoggedIn(true);
          }
      }
      catch(error){
        console.log(error)
        props.setIsLoggedIn(false);
      }
    
  }

  React.useEffect(()=>{
    tokenVerify();
  }, []);

  const handleLogout = async (e) => {
    await axios.post(`http://localhost:3001/logout/`);
    localStorage.removeItem("token");
    props.setIsLoggedIn(false);
    props.setUsername("");
    setFeedback('');
    window.location.reload();
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
