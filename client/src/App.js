
import React from 'react';
import {BrowserRouter, Routes, Route} from "react-router-dom";
import RegistrationComponent from './components/Register';
import HomeComponent from './components/Home';
import NavigationComponent from './components/Navigation';
import ForumComponent from './components/Forum';
import { AllForumPostComponent } from './components/AllForumPostComponent';
import { ViewForumPostComponent } from './components/ViewForumPostComponent';
import FriendsComponent from './components/Friends';
import SettingsComponent from './components/Settings';
import VideoPostWithCommentsComponent from './components/VideoPostWithComments';
import ChatComponent from './components/Chat';
import ProfilePageComponent from './components/ProfilePage';
import SearchVideosComponent from './components/SearchVideos';
import RandomVideoComponent from './components/RandomVideo';
function App() {
  const [token, setToken]= React.useState("");
  return (
    <div className="App">
      <BrowserRouter>
          <NavigationComponent token= {token} setToken= {setToken}/>
          <Routes>
            <Route path="/" element={<HomeComponent token= {token} setToken= {setToken}/>}/>
            <Route path="/register" element={<RegistrationComponent token= {token} setToken= {setToken}/>}/>
            <Route path="/forums" element={<ForumComponent/>}/>
            <Route path="/forumPosts" element={<AllForumPostComponent />} />
            <Route path="/forumPost/:postID/viewing/:userID/user" element={<ViewForumPostComponent />} />
            <Route path="/friends" element= {<FriendsComponent />}/>
            <Route path="/messages" element= {<ChatComponent />}/>
            <Route path="/settings" element= {<SettingsComponent />} />
            <Route path="/video/:VideoPostId" element={<VideoPostWithCommentsComponent />} />
            <Route path="/username/:ProfileUsername" element={<ProfilePageComponent />} />
            <Route path="/search/videos/:keyword" element={<SearchVideosComponent />} />
            <Route path="/random" element={<RandomVideoComponent />}/>
          </Routes>
      </BrowserRouter>
      
    </div>
  );
}

export default App;
