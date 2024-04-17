import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../utils/AxiosWithCredentials';
import "../css/login.css"
import 'bootstrap/dist/css/bootstrap.min.css';

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
          props.setUsername(response.data.username)
          props.setIsLoggedIn(true);
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
    props.setIsLoggedIn(false);
    props.setUsername("");
    setFeedback('');
    window.location.reload();
  }

  return (
    <div>
        {props.isLoggedIn?(
            <div>
             <h3>Welcome, {props.username}!</h3>
             <button onClick={handleLogout}>Logout</button>
            </div>

        ) :props.isLoggedIn===false? (


          <div className='login-container'>
          <div className='login-form-container'>
            <div className='websiteTitle'> ASMR Encyclopedia </div>
            <form onSubmit={handleLogin}>
              <input type="text" placeholder="Username" value={props.username} onChange={(e) => props.setUsername(e.target.value)} />
              <input type="password" placeholder='Password' name="passwordInput"/>
              <button type="submit">Login</button>
            </form>
          </div>
          <div className='link-container'>
            <p>Don't have an account? <Link to="/register">Register Here!</Link></p>
          </div>
          {feedback && feedback ==="Login Successful" && <p className='feedback-message' style={{color:'green'}}>{feedback}</p>}
        </div>

        ):null
        }

    </div>
  );

  ;
};
export default LoginComponent;
