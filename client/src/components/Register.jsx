// RegistrationComponent.js
import React, { useState } from 'react';
import axios from 'axios';

const RegistrationComponent = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/register', 
      {
        username,
        password
      }
      );

      console.log('Registration successful:', response.data);
    } catch (error) {
      console.log('Registration error:', error);

    }
  };

  return (
    <div>
      <h2>Registration</h2>
      <form onSubmit={handleRegister}>
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
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default RegistrationComponent;
