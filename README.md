# ASMR Encyclopedia

Welcome to the ASMR Encyclopedia, a meticulously crafted social media platform for ASMR enthusiasts. Explore, share, and connect with like-minded individuals. Below, you'll find a detailed guide to the features of our platform.

## Table of Contents
- [Features](#features)
  - [Video Uploads](#video-uploads)
  - [Forum Posts Section](#forum-posts)
  - [User Authentication](#user-authentication)
  - [Likes and Dislikes](#likes-and-dislikes)
  - [Comments and Nested Comments](#comments)
  - [Friendship System](#friendship-system)
  - [Chat with Friends](#chat-with-friends)
  - [Search Functionality](#search-functionality)
  - [Video Feed](#video-feed)
  - [Sorting Options](#sorting-options)
  - [Account Settings](#account-settings)
  - [Random Video Option](#random-video)
  - [Real Time Notification System](#notifications)
  - [Playlists](#playlists)
  - [Profile Page](#profile-page)
  - [About Us](#about-us-page)

## Features

### Video Uploads
Users can [upload](#video-uploads) their ASMR videos, each equipped with tags to describe the content.

### Forum Posts
Engage in forum discussions by [posting topics](#forum-posts) with titles, bodies, and tags.

### User Authentication
- **Register and Login:** Secure [user registration and login](#user-authentication) system.
- **REST API** Secure REST API which requires JWT authentication to access any protected routes
- **HTTP Only Cookies** JWT stored in secure HTTP-only cookie to prevent client side javascript from accessing it

### Likes and Dislikes
Users can express their appreciation or disapproval by [liking and disliking](#likes-and-dislikes) posts and comments.

### Comments
Engage in discussions with [comments](#comments), fostering rich conversations.

### Friendship System
- **Friend Requests:** Users can [send, accept, or decline](#friendship-system) friend requests.
- **Unfriending:** The ability to [unfriend](#friendship-system) users.

### Chat with Friends
A dedicated [chat](#chat-with-friends) feature allows users to communicate privately with their friends on the site.

### Search Functionality
Efficiently find desired videos and forum discussions using a robust [search bar](#search-functionality).

### Video Feed
Tailor your video and forum feed by [subscribing to specific tags](#video-feed) and customizing preferences.

### Sorting Options
Sort videos, forum discussions, and comments based on criteria like [oldest, latest, best, and worst](#sorting-options).

### Account Settings
Users can manage their [account settings](#account-settings), including changing their email, password, video and forum post subscription preferences, or deleting their account.

### Random Video Option
Discover something new with a [random video](#random-video) option, which displays a random video from a vast collection of ASMR videos.

### Real-Time Notification System
Stay updated with [real-time notifications](#notifications) for likes, comments, and friend requests.

### Playlists Feature 
Save your favorite videos into organized [playlists](#playlists) for a personalized viewing experience.

### Profile Page 
Explore [user profiles](#profile-page) with post and comment history.

### About Us Page 
Learn more about the platform and its creators in the [About Us](#about-us) page.

## Technologies Used

ASMR Encyclopedia is built using the following technologies:

- HTML
- CSS
- JavaScript
- MySQL2
- Bootstrap
- Yup
- React-tabs
- Cookie-parser
- CORS
- Natural
- Typescript
- Stopword
- Nodemon
- Express.js
- Node.js
- React.js
- React Router
- Socket.io
- Bcrypt
- JWT (JSONWebToken)

Thank you for your interest in exploring the ASMR Encyclopedia! We appreciate you taking the time to view our work. 

## How to Run This Application

Install MySQL Workbench and run the following code in MySQL Workbench:
```sql 
CREATE DATABASE ASMR_DB;
use ASMR_DB;
CREATE TABLE users (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  username varchar(255) UNIQUE NOT NULL,
  password varchar(255) NOT NULL,
  email varchar(255)
);
CREATE TABLE blacklisted_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  token VARCHAR(255) NOT NULL,
  BlacklistedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE VideoPost (
  VideoPostId INT AUTO_INCREMENT PRIMARY KEY,
  UserId INT NOT NULL,
  Title VARCHAR(255) NOT NULL,
  VideoLinkId VARCHAR(255) NOT NULL UNIQUE,
  PostedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (UserId) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE LikeDislike (
  LikeDislikeId INT AUTO_INCREMENT PRIMARY KEY,
  VideoPostId INT NOT NULL,
  UserId INT NOT NULL,
  LikeStatus BOOLEAN NOT NULL,
  FOREIGN KEY (VideoPostId) REFERENCES VideoPost(VideoPostId) ON DELETE CASCADE,
  FOREIGN KEY (UserId) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (VideoPostId, UserId)
);
CREATE TABLE Genre (
  GenreId INT AUTO_INCREMENT PRIMARY KEY,
  Genre VARCHAR(255) COLLATE utf8mb4_general_ci UNIQUE NOT NULL
);
CREATE TABLE VideoPostGenre (
  VideoPostGenreId INT AUTO_INCREMENT PRIMARY KEY,
  VideoPostId INT NOT NULL,
  GenreId INT NOT NULL,
  FOREIGN KEY (VideoPostId) REFERENCES VideoPost(VideoPostId) ON DELETE CASCADE,
  FOREIGN KEY (GenreId) REFERENCES Genre(GenreId) ON DELETE CASCADE,
  UNIQUE (VideoPostId, GenreId)
);

CREATE TABLE forums (
  id INT AUTO_INCREMENT UNIQUE,
  title varchar(255) NOT NULL UNIQUE,
  description varchar(255) NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE ForumPost(
  id INT AUTO_INCREMENT UNIQUE,
  username varchar(255) NOT NULL,
  title varchar(255) NOT NULL, 
  body TEXT NOT NULL, 
  post_timestamp timestamp NOT NULL, 
  tfidf_vector TEXT,
  PRIMARY KEY(id),
  FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
);

CREATE TABLE ForumTag(
  ForumTagID INT AUTO_INCREMENT PRIMARY KEY,
  ForumTagName Varchar(255) NOT NULL UNIQUE
);

CREATE TABLE ForumPostTag(
  ForumPostTagID INT AUTO_INCREMENT PRIMARY KEY,
  ForumPostID INT NOT NULL,
  ForumTagID INT NOT NULL,
  FOREIGN KEY (ForumPostID) REFERENCES ForumPost(id) ON DELETE CASCADE,
  FOREIGN KEY (ForumTagID) REFERENCES ForumTag(ForumTagID) ON DELETE CASCADE,
  UNIQUE (ForumPostID, ForumTagID)
);

CREATE TABLE ForumPostLikeDislike(
  LikeDislikeID INT AUTO_INCREMENT PRIMARY KEY,
  ForumPostID INT NOT NULL,
  UserID INT NOT NULL,
  LikeStatus BOOLEAN NOT NULL,
  FOREIGN KEY (ForumPostID) REFERENCES ForumPost(id) ON DELETE CASCADE,
  FOREIGN KEY (UserId) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (ForumPostID, UserId)
);

CREATE TABLE ForumPostComments(
  id INT AUTO_INCREMENT UNIQUE, 
  forum_post_id INT, 
  username varchar(255), 
  body text NOT NULL, 
  comment_timestamp timestamp NOT NULL,
  parent_comment_id INT DEFAULT NULL,
  NotificationRead BOOLEAN DEFAULT FALSE, 
  deleted boolean DEFAULT false NOT NULL,
  PRIMARY KEY (id), 
  FOREIGN KEY (forum_post_id) REFERENCES ForumPost(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_comment_id) REFERENCES ForumPostComments(id) ON DELETE CASCADE,
  FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
);

CREATE TABLE ForumCommentLikeDislike(
  LikeDislikeID INT AUTO_INCREMENT PRIMARY KEY,
  ForumPostCommentID INT NOT NULL,
  UserID INT NOT NULL,
  LikeStatus BOOLEAN NOT NULL,
  FOREIGN KEY (ForumPostCommentID) REFERENCES ForumPostComments(id) ON DELETE CASCADE,
  FOREIGN KEY (UserId) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (ForumPostCommentID, UserId)
);


CREATE TABLE VideoPostComments (
  VideoPostCommentId INT AUTO_INCREMENT PRIMARY KEY,
  UserId INT NOT NULL,
  Comment VARCHAR(5000) NOT NULL,
  VideoPostId INT NOT NULL,
  ReplyToVideoPostCommentId INT,
  CommentedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  DELETED BOOLEAN NOT NULL,
  NotificationRead BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (UserId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (VideoPostId) REFERENCES VideoPost(VideoPostId) ON DELETE CASCADE,
  FOREIGN KEY (ReplyToVideoPostCommentId) REFERENCES VideoPostComments(VideoPostCommentId) ON DELETE CASCADE
);
CREATE TABLE VideoPostCommentLikeDislike (
  VideoPostCommentLikeDislikeId INT AUTO_INCREMENT PRIMARY KEY,
  VideoPostCommentId INT NOT NULL,
  UserId INT NOT NULL,
  LikeStatus BOOLEAN NOT NULL,
  FOREIGN KEY (VideoPostCommentId) REFERENCES VideoPostComments(VideoPostCommentId) ON DELETE CASCADE,
  FOREIGN KEY (UserId) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (VideoPostCommentId, UserId)
);

CREATE TABLE FriendRequests (
  FriendRequestId INT AUTO_INCREMENT PRIMARY KEY,
  SenderUserId INT NOT NULL,
  ReceiverUserId INT NOT NULL,
  SentAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(SenderUserId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(ReceiverUserId) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(SenderUserId, ReceiverUserId),
  CHECK(SenderUserId != ReceiverUserId)
);-- Make sure to check that a user cant send a friend request to someone who already has sent them a friend request which hasnt been accepted or declined yet.

CREATE TABLE Friendships (
  FriendshipId INT AUTO_INCREMENT PRIMARY KEY,
  UserId1 INT NOT NULL,
  UserId2 INT NOT NULL,
  AcceptedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(UserId1) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(UserId2) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(UserId1 , UserId2),
  CHECK(UserId1 < UserId2)
);

CREATE TABLE VideoSubscriptionOnly ( -- represents if the user wants only the selected genres or everything except only the selected genres
  VideoSubscriptionOnlyId INT AUTO_INCREMENT PRIMARY KEY,
  UserId INT NOT NULL,
  Only BOOLEAN NOT NULL,
  FOREIGN KEY(UserId) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(UserId, Only)
);

CREATE TABLE VideoSubscriptions (
  VideoSubscriptionId INT AUTO_INCREMENT PRIMARY KEY,
  UserId INT NOT NULL,
  GenreId INT NOT NULL,
  FOREIGN KEY(UserId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (GenreId) REFERENCES Genre(GenreId) ON DELETE CASCADE,
  UNIQUE(UserId, GenreId)
);

CREATE TABLE ForumSubscriptionOnly (
  ForumSubscriptionOnlyID INT AUTO_INCREMENT PRIMARY KEY,
  UserID INT NOT NULL UNIQUE,
  Only BOOLEAN NOT NULL UNIQUE,
  FOREIGN KEY(UserID) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE ForumSubscriptions (
  ForumSubscriptionID INT AUTO_INCREMENT PRIMARY KEY,
  UserID INT NOT NULL,
  ForumTagID INT NOT NULL UNIQUE,
  FOREIGN KEY(UserID) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (ForumTagID) REFERENCES ForumTag(ForumTagID) ON DELETE CASCADE
);

CREATE TABLE ChatMessage (
  ChatMessageId INT AUTO_INCREMENT PRIMARY KEY,
  SenderUserId INT NOT NULL,
  ReceiverUserId INT NOT NULL,
  Message VARCHAR(5000) NOT NULL,
  SentAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(SenderUserId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(ReceiverUserId) REFERENCES users(id) ON DELETE CASCADE,
  CHECK (SenderUserId != ReceiverUserId)
);

CREATE TABLE Playlist(
  PlaylistID INT AUTO_INCREMENT PRIMARY KEY,
  PlaylistName VARCHAR(255) NOT NULL,
  DateCreated DATETIME NOT NULL,
  UserID INT NOT NULL,
  FOREIGN KEY (UserID) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE PlaylistVideoPosts(
  PlaylistVideoPostsID INT AUTO_INCREMENT PRIMARY KEY,
  DateAdded DATETIME NOT NULL,
  VideoPostID INT NOT NULL,
  PlaylistID INT NOT NULL,
  FOREIGN KEY (PlaylistID) REFERENCES Playlist(PlaylistID) ON DELETE CASCADE,
  FOREIGN KEY (VideoPostID) REFERENCES VideoPost(VideoPostId) ON DELETE CASCADE
);
```