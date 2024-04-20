
import React from 'react';
import {BrowserRouter, Routes, Route} from "react-router-dom";
import RegistrationComponent from './components/Register';
import HomeComponent from './components/Home';
import NavigationComponent from './components/Navigation';
import ForumComponent from './components/Forum';
import { AllForumPostComponent } from './components/AllForumPostComponent';
import { ViewForumPostComponent } from './components/ViewForumPostComponent';
import { SearchForumPostComponent } from './components/SearchForumPostComponent';
import FriendsComponent from './components/Friends';
import SettingsComponent from './components/Settings';
import VideoPostWithCommentsComponent from './components/VideoPostWithComments';
import ChatComponent from './components/Chat';
import ProfilePageComponent from './components/ProfilePage';
import RandomVideoComponent from './components/RandomVideo';
import SingleVideoCommentComponent from './components/SingleVideoComment.tsx';
import { UserProfileComponent } from './components/UserProfileComponent';
import { UserPlaylistComponent } from './components/UserPlaylistComponent';
import { ViewUserPlaylistComponent } from './components/ViewUserPlaylistComponent';
import { SingleForumCommentComponent } from './components/SingleForumCommentComponent.jsx';
import NotificationsComponent from './components/Notifications.jsx';
import { SearchComponent } from './components/SearchResults.jsx';

import "./App.css"
function App() {
  return (
    <div className="App">
      <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomeComponent />}/>
            <Route path="/navTest" element={<NavigationComponent />} />
            <Route path="/register" element={<RegistrationComponent/>}/>
            <Route path="/forums" element={<ForumComponent/>}/>
            <Route path="/forumPosts" element={<AllForumPostComponent />} />
            <Route path="/forumPost/:postID/viewing/:userID/user" element={<ViewForumPostComponent />} />
            <Route path="/friends" element= {<FriendsComponent />}/>
            <Route path="/messages" element= {<ChatComponent />}/>
            <Route path="/settings" element= {<SettingsComponent />} />
            <Route path="/video/:VideoPostId" element={<VideoPostWithCommentsComponent />} />
            <Route path="/username/:ProfileUsername" element={<ProfilePageComponent />} />
            <Route path="/searchResults/:searchTerm" element={<SearchComponent />} />
            <Route path="/random" element={<RandomVideoComponent />}/>
            <Route path= "/SingleVideoComment/:VideoPostCommentId" element={<SingleVideoCommentComponent />} />
            <Route path= "/singleForumComment/:forumPostCommentID" element={<SingleForumCommentComponent />} />
            <Route path="/userPlaylists/" element={<UserPlaylistComponent />}/>
            <Route path="/userPlaylists/:playlistID/viewing/:userID/user" element={<ViewUserPlaylistComponent/>}/>
            <Route path="/notifications" element={<NotificationsComponent AllNotificationsPage = {true}/>} />
          </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
