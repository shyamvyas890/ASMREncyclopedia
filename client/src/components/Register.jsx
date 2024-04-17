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
    <div style={{ textAlign: 'center', margin: '50px auto', maxWidth: '400px', padding: '20px', backgroundColor: '#333', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
  <h2 style={{ marginBottom: '20px', color: '#fff' }}>Registration</h2>
  <form onSubmit={handleRegister}>
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', marginBottom: '5px', color: '#fff' }}>Username:</label>
      <input style={{ width: '100%', padding: '10px', borderRadius: '5px', border: 'none' }} type="text" name='usernameInput' />
    </div>
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', marginBottom: '5px', color: '#fff' }}>Password:</label>
      <input style={{ width: '100%', padding: '10px', borderRadius: '5px', border: 'none' }} type="password" name='passwordInput' />
    </div>
    <button style={{ width: '100%', padding: '10px', borderRadius: '5px', border: 'none', backgroundColor: '#4CAF50', color: '#fff', cursor: 'pointer' }} type="submit">Register</button>
  </form>
  <div style={{ marginTop: '20px', color: '#fff' }}>Already have an account? <Link to="/" style={{ color: '#4CAF50', textDecoration: 'underline' }}>Login here!</Link></div>
  {feedback && (
    <p style={{ marginTop: '20px', color: feedback === "This username is already taken. Please choose a different username." ? 'red' : 'green' }}>{feedback}</p>
  )}
</div>

  );
};

export default RegistrationComponent;
