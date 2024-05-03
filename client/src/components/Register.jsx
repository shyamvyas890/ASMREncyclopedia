// RegistrationComponent.js
import React, { useState } from 'react';
import axios from '../utils/AxiosWithCredentials';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import RegisterCSS from "../css/register.module.css"


const RegistrationComponent = () => {
  const [feedback, setFeedback] = useState('');
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/register', 
      {
        username:e.target.elements.usernameInput.value,
        password:e.target.elements.passwordInput.value
      }
      );
      e.target.elements.usernameInput.value="";
      e.target.elements.passwordInput.value="";
      setFeedback(response.data);
      
    } catch (error) {
        if(error.response.data==="This username is already taken. Please choose a different username."){
            e.target.elements.usernameInput.value="";
            e.target.elements.passwordInput.value="";
            setFeedback(error.response.data);
            
        }
    }
  };
  return (
    <div className={RegisterCSS['login-container']}>
          <div className={RegisterCSS['login-form-container']}>
            <div className={RegisterCSS['websiteTitle']}> ASMR Encyclopedia </div>
            <form className={RegisterCSS['login-form']} onSubmit={handleRegister}>
              <input className={RegisterCSS['login-form-username']} type="text" placeholder="Username" name="usernameInput"/>
              <input className={RegisterCSS['login-form-password']} type="password" placeholder='Password' name="passwordInput"/>
              <button className={RegisterCSS['login-form-button']} type="submit"> Register </button>
            </form>
          </div>
          <div className={RegisterCSS['link-container']}>
            <p> Already have an account? <Link to="/"> Login Here!</Link></p>
          </div>
          {feedback && feedback==="This username is already taken. Please choose a different username." && <p style={{color:'red'}}>{feedback}</p>}
          {feedback && feedback ==="User registered successfully" && <p className='feedback-message' style={{color:'green'}}>{feedback}</p>}
        </div>
  );
};

export default RegistrationComponent;
