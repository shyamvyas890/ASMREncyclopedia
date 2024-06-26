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