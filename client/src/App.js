
import React from 'react';
import {BrowserRouter, Routes, Route} from "react-router-dom";
import RegistrationComponent from './components/Register';
import HomeComponent from './components/Home';
import NavigationComponent from './components/Navigation';
import ForumComponent from './components/Forum';
import UserPostsComponent from './components/UserPosts';
import { ViewForumPostComponent } from './components/ViewForumPostComponent';

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
            <Route path="/forumPost/:id" element={<ViewForumPostComponent/>} />
          </Routes>
      </BrowserRouter>
      
    </div>
  );
}

export default App;
