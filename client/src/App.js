
import React from 'react';
import {BrowserRouter, Routes, Route} from "react-router-dom";
import RegistrationComponent from './components/Register';
import HomeComponent from './components/Home';
import NavigationComponent from './components/Navigation';
import FriendsComponent from './components/Friends';
import SettingsComponent from './components/Settings';
function App() {
  const [token, setToken]= React.useState("");
  return (
    <div className="App">
      <BrowserRouter>
          <NavigationComponent token= {token} setToken= {setToken}/>
          <Routes>
            <Route path="/" element={<HomeComponent token= {token} setToken= {setToken}/>}/>
            <Route path="/register" element={<RegistrationComponent token= {token} setToken= {setToken}/>}/>
            <Route path="/friends" element= {<FriendsComponent />}/>
            <Route path="/settings" element= {<SettingsComponent />} />
          </Routes>
      </BrowserRouter>
      
    </div>
  );
}

export default App;
