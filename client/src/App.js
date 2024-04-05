
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
import SearchVideosComponent from './components/SearchVideos';
import RandomVideoComponent from './components/RandomVideo';
import SingleVideoCommentComponent from './components/SingleVideoComment.tsx';
import { UserProfileComponent } from './components/UserProfileComponent';
import { UserPlaylistComponent } from './components/UserPlaylistComponent';
import { ViewUserPlaylistComponent } from './components/ViewUserPlaylistComponent';
import { SingleForumCommentComponent } from './components/SingleForumCommentComponent.jsx';
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
            <Route path="/forumPost/search_by/:searchTitle" element={<SearchForumPostComponent />} />
            <Route path="/friends" element= {<FriendsComponent />}/>
            <Route path="/messages" element= {<ChatComponent />}/>
            <Route path="/settings" element= {<SettingsComponent />} />
            <Route path="/video/:VideoPostId" element={<VideoPostWithCommentsComponent />} />
            <Route path="/username/:ProfileUsername" element={<ProfilePageComponent />} />
            <Route path="/search/videos/:keyword" element={<SearchVideosComponent />} />
            <Route path="/random" element={<RandomVideoComponent />}/>
            <Route path= "/SingleVideoComment/:VideoPostCommentId" element={<SingleVideoCommentComponent />} />
            <Route path= "/singleForumComment/:forumPostCommentID" element={<SingleForumCommentComponent />} />
            <Route path="/userHistory/:username" element={<UserProfileComponent />} />
            <Route path="/username/:username" element={<ProfilePageComponent />} />
            <Route path="/userPlaylists/" element={<UserPlaylistComponent />}/>
            <Route path="/userPlaylists/:playlistID/viewing/:userID/user" element={<ViewUserPlaylistComponent/>}/>
          </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
