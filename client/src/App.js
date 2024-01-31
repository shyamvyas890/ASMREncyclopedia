
import React from 'react';
import {BrowserRouter, Routes, Route} from "react-router-dom";
import RegistrationComponent from './components/Register';
import HomeComponent from './components/Home';
import NavigationComponent from './components/Navigation';
import FriendsComponent from './components/Friends';
import SettingsComponent from './components/Settings';
import VideoPostWithCommentsComponent from './components/VideoPostWithComments';
import ChatComponent from './components/Chat';
import ProfilePageComponent from './components/ProfilePage';
import SearchVideosComponent from './components/SearchVideos';
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
            <Route path="/messages" element= {<ChatComponent />}/>
            <Route path="/settings" element= {<SettingsComponent />} />
            <Route path="/video/:VideoPostId" element={<VideoPostWithCommentsComponent />} />
            <Route path="/username/:ProfileUsername" element={<ProfilePageComponent />} />
            <Route path="/search/videos/:keyword" element={<SearchVideosComponent />} />
          </Routes>
      </BrowserRouter>
      
    </div>
  );
}

export default App;
