CREATE DATABASE ASMR_DB;
use ASMR_DB;
CREATE TABLE `users` (
  id int NOT NULL AUTO_INCREMENT,
  username varchar(255) NOT NULL,
  password varchar(255) NOT NULL,
  PRIMARY KEY ('id'),
  UNIQUE KEY unique_username ('username')
)
CREATE TABLE blacklisted_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  token VARCHAR(255) NOT NULL,
  blacklisted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE VideoPost (
  VideoPostId INT AUTO_INCREMENT PRIMARY KEY,
  UserId INT NOT NULL,
  Title VARCHAR(255) NOT NULL,
  VideoLinkId VARCHAR(255) NOT NULL UNIQUE,
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
CREATE TABLE VideoPostComments (
  VideoPostCommentId INT AUTO_INCREMENT PRIMARY KEY,
  UserId INT NOT NULL,
  Comment VARCHAR(5000) NOT NULL,
  VideoPostId INT NOT NULL,
  ReplyToVideoPostCommentId INT,
  DELETED BOOLEAN NOT NULL,
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