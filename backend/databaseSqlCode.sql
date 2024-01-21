CREATE DATABASE ASMR_DB;
use ASMR_DB;
CREATE TABLE users (
  id int NOT NULL AUTO_INCREMENT,
  username varchar(255) NOT NULL,
  password varchar(255) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY unique_username (username)
);

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
  Genre VARCHAR(255) UNIQUE NOT NULL
);
CREATE TABLE VideoPostGenre (
  VideoPostGenreId INT AUTO_INCREMENT PRIMARY KEY,
  VideoPostId INT NOT NULL,
  GenreId INT NOT NULL,
  FOREIGN KEY (VideoPostId) REFERENCES VideoPost(VideoPostId) ON DELETE CASCADE,
  FOREIGN KEY (GenreId) REFERENCES Genre(GenreId),
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
forums TEXT,
PRIMARY KEY(id),
FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
);

CREATE TABLE ForumPostComments(
id INT AUTO_INCREMENT UNIQUE, 
forum_post_id INT, 
username varchar(255), 
body text NOT NULL, 
comment_timestamp timestamp NOT NULL,
parent_comment_id INT DEFAULT NULL, 
PRIMARY KEY (id), 
FOREIGN KEY (forum_post_id) REFERENCES ForumPost(id), 
FOREIGN KEY (parent_comment_id) REFERENCES ForumPostComments(id) ON DELETE CASCADE);

DROP TABLE ForumPostComments;

