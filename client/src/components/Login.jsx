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
            <div className="login-info">
             <h3>Welcome, {props.username}!</h3>
             <button onClick={handleLogout}>Logout</button>
            </div>

        ) :props.isLoggedIn===false? (
        
          <div className="container">
          <div className="body d-md-flex align-items-center justify-content-between">
            <div className="box-1 mt-md-0 mt-5">
              <img src="https://images.pexels.com/photos/2033997/pexels-photo-2033997.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500"/>
            </div>
            <div className=" box-2 d-flex flex-column h-100">
              <div className="mt-5">
                <p className="mb-1 h-1"> ASMR Encyclopedia </p>
                <p className="mb-2"> Experience ASMR today.</p>
                <div className="d-flex flex-column ">
                  
                  <div className="align-items-center">
                   <form onSubmit={handleLogin}>
                     <input type="text" placeholder="Username" value={props.username} onChange={(e) => props.setUsername(e.target.value)} />
                     <br />
                     <input type="password" placeholder='Password' name="passwordInput"/>
                     <br />
                     <button className="btn btn-primary" type="submit">Login</button>
                   </form>

                  </div>
                </div>
              </div>
    
              <p className="after-text"> Connect with ASMR enthusiasts around the world.</p>
              <p className="after-text"> Share videos and create posts to discuss ASMR. </p>

              <p className="after-text"> Don't have an account? <Link to="/register"> Register Here! </Link></p>
              {feedback && (feedback==="Your password is incorrect." || feedback==="This username does not exist." || feedback==="Error logging in.") && <p style={{color:'red'}}>{feedback}</p>}
              {feedback && feedback ==="Login Successful" && <p style={{color:'green'}}>{feedback}</p>}
            </div>
            <span className="fas fa-times" />
          </div>
        </div>
        ):null
        }

    </div>
  );
};
export default LoginComponent;
