// RegistrationComponent.js
import React, { useState } from 'react';
import axios from '../utils/AxiosWithCredentials';
import { Link } from 'react-router-dom';
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
    <div>
      <h2>Registration</h2>
      <form onSubmit={handleRegister}>
        <label>
          Username:
          <input type="text" name='usernameInput' />
        </label>
        <br />
        <label>
          Password:
          <input type="password" name='passwordInput' />
        </label>
        <br />
        <button type="submit">Register</button>
      </form>
      <div>Already have an account? <Link to="/">Login here!</Link></div>
      {feedback && feedback==="This username is already taken. Please choose a different username." && <p style={{color:'red'}}>{feedback}</p>}
      {feedback && feedback=== "User registered successfully" && <p style={{color:'green'}}>{feedback}</p>}
    </div>
  );
};

export default RegistrationComponent;
