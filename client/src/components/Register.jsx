// RegistrationComponent.js
import React, { useState } from 'react';
import axios from '../utils/AxiosWithCredentials';
import { Link } from 'react-router-dom';
import "../css/register.css"
import 'bootstrap/dist/css/bootstrap.min.css';

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
    <div className="container">
          <div className="body d-md-flex align-items-center justify-content-between">
            <div className="box-1 mt-md-0 mt-5">
              <img src="https://images.unsplash.com/photo-1436891620584-47fd0e565afb?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"/>
            </div>
            <div className=" box-2 d-flex flex-column h-100">
              <div className="mt-5">
                <p className="mb-1 h-1"> Registration </p>
                <p className="mb-2"> Experience ASMR today.</p>
                <div className="d-flex flex-column ">
                  
                  <div className="align-items-center">
                  <form onSubmit={handleRegister}>
                   <input type="text" name='usernameInput' placeholder='Username'/>
                   <br />
                   <input type="password" name='passwordInput' placeholder='Password'/>
                   <br />
                   <button className="btn btn-primary">Register</button>
                  </form>
                  </div>
                </div>
              </div>
    
              <p className="after-text"> Connect with ASMR enthusiasts around the world.</p>
              <p className="after-text"> Share videos and create posts to discuss ASMR. </p>
              <p className="after-text"> Already have an account? <Link to="/">Login here!</Link> </p>
            </div>
            <span className="fas fa-times" />
          </div>
        </div>
  );
};

export default RegistrationComponent;
