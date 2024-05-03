import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../utils/AxiosWithCredentials';
import LoginCSS from "../css/login.module.css"
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
          <div></div>
        ) :props.isLoggedIn===false? (


          <div className={LoginCSS['login-container']}>
          <div className={LoginCSS['login-form-container']}>
            <div className={LoginCSS['websiteTitle']}> ASMR Encyclopedia </div>
            <form className={LoginCSS['login-form']} onSubmit={handleLogin}>
              <input className={LoginCSS['login-form-username']} type="text" placeholder="Username" value={props.username} onChange={(e) => props.setUsername(e.target.value)} />
              <input className={LoginCSS['login-form-password']} type="password" placeholder='Password' name="passwordInput"/>
              <button className={LoginCSS['login-form-button']} type="submit">Login</button>
              {feedback && (feedback==="Your password is incorrect." || feedback==="This username does not exist." || feedback==="Error logging in.") && <p style={{color:'red'}}>{feedback}</p>}
            </form>
          </div>
          <div className={LoginCSS['link-container']}>
            <p>Don't have an account? <Link to="/register">Register Here!</Link></p>
          </div>
          

        </div>

        ):null
        }

    </div>
  );

  ;
};
export default LoginComponent;
