const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
const cors= require("cors");
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const port = 3001;
const secretKey= "secret_key" //Will change this later

var natural = require('natural');
var TfIdf = natural.TfIdf;
var tfidf = new TfIdf();
var tokenizer = new natural.WordTokenizer()
var stopwords = require('stopword');
const { constrainedMemory } = require('process');
const enStopwords = [
    "i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", "yours", "yourself", "yourselves",
    "he", "him", "his", "himself", "she", "her", "hers", "herself", "it", "its", "itself", "they", "them", "their",
    "theirs", "themselves", "what", "which", "who", "whom", "this", "that", "these", "those", "am", "is", "are",
    "was", "were", "be", "been", "being", "have", "has", "had", "having", "do", "does", "did", "doing", "a", "an",
    "the", "and", "but", "if", "or", "because", "as", "until", "while", "of", "at", "by", "for", "with", "about",
    "against", "between", "into", "through", "during", "before", "after", "above", "below", "to", "from", "up", "down",
    "in", "out", "on", "off", "over", "under", "again", "further", "then", "once", "here", "there", "when", "where",
    "why", "how", "all", "any", "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not",
    "only", "own", "same", "so", "than", "too", "very", "s", "t", "can", "will", "just", "don", "should", "now"
  ];
  
app.use(express.json())
app.use(express.urlencoded({ extended: true })); // Might not need this
app.use(cors({
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  }));
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '#jySJSU2024',
    database: 'ASMR_DB',
  });
  db.connect((err) => {
    if (err) {
      console.error('Error connecting to MySQL:', err);
    } else {
      console.log('Connected to MySQL');
    }
  });
  const queryTheDatabase= (theQuery, theArray, res)=>{
    db.query(theQuery, theArray, (error, results)=>{
        if(error){
            console.log(error)
            res.status(500).send("Internal Server Error");
        }
        res.send(results);
    })
  } 
  app.post("/register", async (req,res)=>{
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 13);
    db.query(
    'INSERT INTO users (username, password) VALUES (?, ?)',
    [username, hashedPassword],
    function(err){
        if(err){
            console.log(err);
            if(err.errno===1062){
                return res.status(500).send("This username is already taken. Please choose a different username.")
            }

            return res.status(500).send(err);
        }
        else{
            return res.status(201).send('User registered successfully');
        }
    }
    );

  });

  app.put("/changePassword", async (req, res)=>{
    const {username, password}= req.body;
    const hashedPassword = await bcrypt.hash(password, 13);
    queryTheDatabase("UPDATE users SET password = ? WHERE username= ? ", [hashedPassword,username], res);

  })
  app.post("/login", async (req, res)=>{
    const { username, password } = req.body;
    db.query(
        'SELECT * FROM users WHERE username = ?',
        [username],
        async (err, results) => {
            if(err){
                console.log(err);
                res.status(500).send("Error logging in")
            }
            else if (results.length>0){
                const match = await bcrypt.compare(password, results[0].password);
                if (match) {
                    const exp = Math.floor(Date.now() / 1000) + 86400;
                    const token = jwt.sign({ username, exp }, secretKey);
                    return res.status(200).json({ token });
                } 
                else {
                    res.status(401).send('Incorrect password');
                }
            }
            else {
                res.status(404).send('User not found');
            }
        }
    );
  })
  app.get('/verify-token/:token', (req, res)=>{
    const submittedToken= req.params.token;

    const verificationFunction = function(err, results){
        if(err){
            console.log(err);
        }
        else if(results.length>0){
            return res.status(401).send("Token is invalid and blacklisted");  
        }
        try {
            const decodedToken = jwt.verify(submittedToken, secretKey);
            return res.json(decodedToken);
        }
        catch(error) {
            return res.json(error);
        }
    }

    db.query('SELECT * FROM blacklisted_tokens WHERE token = ?', [submittedToken], verificationFunction )
  })

  app.post('/logout/:token', (req,res)=>{
    const token=req.params.token;
    db.query('INSERT INTO blacklisted_tokens (token) VALUES (?)', [token], function(err){
        if(err){
            console.log(err);
            res.status(500).send('Error blacklisting token');
        }
        else {
            res.status(201).send("Successfully blacklisted token")
        }
    })
  })

  app.get('/users',(req,res)=>{
    db.query('SELECT * FROM users', (err, results)=>{
        if(err){
            console.log(err);
            return res.json("Error retrieving all users")
        }
        return res.json(results.map((result)=>{
            return {id:result.id,
                    username:result.username}
        }));
    })
  })

  app.post('/video/:VideoId', (req,res)=>{
    const VideoLinkId= req.params.VideoId;
    const {UserId, Title} = req.body
    db.query('INSERT INTO VideoPost (UserId, Title, VideoLinkId) VALUES (?, ?, ?)', [UserId, Title, VideoLinkId], (err, results)=>{
        if(err){
            console.log(err);
            res.status(500).send("Error adding video");
        }
        else {
            res.status(201).send(results);
        }
    } )
  })

  app.post('/video-rating/:VideoPostId', (req,res)=>{
        const VideoPostId= req.params.VideoPostId;
        const {UserId, LikeStatus}= req.body;
        db.query('INSERT INTO LikeDislike (VideoPostId, UserId, LikeStatus) VALUES (?, ?, ?)', [VideoPostId, UserId, LikeStatus], (err)=>{
            if(err){
                console.log(err)
                res.status(500).send("Error adding rating")
            }
            else {
                res.status(201).send("Successfully added rating")
            }
        })
  })

  app.post('/genre', (req,res)=>{
        const genre= req.body.genre;
        db.query('INSERT INTO Genre (Genre) VALUES (?)', [genre], (err, results)=>{
            if(err){
                console.log(err)
                res.status(500).send("Error adding genre")
            }
            else {
                res.status(201).send(results);
            }
        })
  })

  app.get('/users/id', (req, res)=> {
        const {username, UserId}= req.query
        console.log(username)
        if(username){
            db.query('SELECT * FROM users WHERE username = ?', [username], (err, results)=>{
                if(err){
                    console.log(err)
                    res.status(500).send("Something went wrong")
                }
                else if(results.length===0){
                    res.status(404).send("This username doesn't exist")
                }
                else {
                    res.status(200).send({id:results[0].id})
                }
            })
        }
        else {
            db.query('SELECT * FROM users WHERE id = ?', [UserId], (err, results)=>{
                if(err){
                    console.log(err)
                    res.status(500).send("Something went wrong")
                }
                else if(results.length===0){
                    res.status(404).send("This username doesn't exist")
                }
                else {
                    res.status(200).send({username:results[0].username})
                }
            })
        }
  })

  app.get('/genre/id', (req, res)=> {
    const {genre}= req.query
    db.query('SELECT * FROM Genre WHERE Genre = ?', [genre], (err, results)=>{
        if(err){
            console.log(err)
            res.status(500).send("Something went wrong")
        }
        else if(results.length===0){
            res.status(404).send("This genre doesn't exist")
        }
        else {
            res.status(200).send({GenreId:results[0].GenreId})
        }
    })
})

app.get('/video/id', (req, res)=>{
    const {VideoLinkId, VideoPostId} = req.query
    if(VideoLinkId){
        db.query('SELECT * FROM VideoPost WHERE VideoLinkId = ?', [VideoLinkId], (err, results)=>{
            if(err){
                console.log(err)
                res.status(500).send("Something went wrong")
            }
            else if(results.length===0){
                res.status(404).send("This video doesn't exist in the database")
            }
            else {
                res.status(200).json(results)
            }
        })
    }
    else {
        db.query('SELECT * FROM VideoPost WHERE VideoPostId = ?', [VideoPostId], (err, results)=>{
            if(err){
                console.log(err)
                res.status(500).send("Something went wrong")
            }
            else if(results.length===0){
                res.status(404).send("This video doesn't exist in the database")
            }
            else {
                res.status(200).json(results)
            }
        })
    }   
})
app.delete('/video', (req, res)=>{
    const {id, VideoPostId, LikeDislikeId, GenreId, VideoPostGenreId, UserId, VideoPostCommentId}= req.query
    if(id){
        db.query('DELETE FROM users WHERE id = ?', [id], (err)=>{
            if(err){
                console.log(err);
                res.status(500).send("Error in deleting user");
            }
            else {
                res.status(200).send("Successfully deleted user")
            }
        });
    }
    else if(VideoPostId){
        db.query('DELETE FROM VideoPost WHERE VideoPostId = ?', [VideoPostId], (err)=>{
            if(err){
                console.log(err);
                res.status(500).send("Error in deleting Video Post");
            }
            else {
                res.status(200).send("Successfully deleted Video Post")
            }
        });

    }
    else if(LikeDislikeId){
        db.query('DELETE FROM LikeDislike WHERE LikeDislikeId = ?', [LikeDislikeId], (err)=>{
            if(err){
                console.log(err);
                res.status(500).send("Error in deleting Like or Dislike");
            }
            else {
                res.status(200).send("Successfully deleted Like or Dislike")
            }
        });

    }
    else if(GenreId){
        db.query('DELETE FROM Genre WHERE GenreId = ?', [GenreId], (err)=>{
            if(err){
                console.log(err);
                res.status(500).send("Error in deleting Genre");
            }
            else {
                res.status(200).send("Successfully deleted Genre")
            }
        });
    }
    else if(VideoPostCommentId && UserId){
        db.query('DELETE FROM VideoPostCommentLikeDislike WHERE VideoPostCommentId = ? AND UserId = ?', [VideoPostCommentId, UserId], (err)=>{
            if(err){
                console.log(err);
                res.status(500).send("Error in deleting Video Comment rating");
            }
            else {
                res.status(200).send("Successfully deleted Video comment rating")
            }
        });

    }
    else if(VideoPostCommentId){ 
        db.query('UPDATE VideoPostComments SET Comment = ?, DELETED = ? WHERE VideoPostCommentId = ?', ["deleted",true,VideoPostCommentId], (err)=>{
            if(err){
                console.log(err);
                res.status(500).send("Error in deleting comment");
            }
            else {
                res.status(200).send("Successfully deleted comment")
            }
        });
    }
    else if(VideoPostGenreId) {
        db.query('DELETE FROM VideoPostGenre WHERE VideoPostGenreId = ?', [VideoPostGenreId], (err)=>{
            if(err){
                console.log(err);
                res.status(500).send("Error in deleting Video Genre");
            }
            else {
                res.status(200).send("Successfully deleted Video Genre")
            }
        });
    }
})
app.get('/video',(req,res)=>{
    db.query('SELECT * FROM VideoPost', (err, results)=>{
        if(err) {
            console.log(err)
            res.status(500).send("Internal Server Error");
        }
        return res.json(results);
    });
})

app.get('/video-by-genre-or-user',(req,res)=>{
    const {GenreId, UserId, VideoPostId}= req.query;
    if(GenreId){
        db.query('SELECT * FROM VideoPostGenre WHERE GenreId = ?',[GenreId], (err, results)=>{
            if(err) {
                console.log(err)
                res.status(500).send("Internal Server Error");
            }
            return res.json(results);
        });
    }
    else if(UserId) {
        db.query('SELECT * FROM VideoPost WHERE UserId = ?',[UserId], (err, results)=>{
            if(err) {
                console.log(err)
                res.status(500).send("Internal Server Error");
            }
            return res.json(results);
        });
    }
    else {
        db.query('SELECT * FROM VideoPostGenre WHERE VideoPostId = ?',[VideoPostId], (err, results)=>{
            if(err) {
                console.log(err)
                res.status(500).send("Internal Server Error");
            }
            return res.json(results);
        });
    }
})

app.get('/video-rating', (req,res)=>{   
    const {VideoPostId, UserId}= req.query
    
    if(VideoPostId && UserId){
        db.query('SELECT * FROM LikeDislike WHERE VideoPostId = ? AND UserId= ?', [VideoPostId, UserId], (err, results)=>{
            if(err) {
                console.log(err)
                res.status(500).send("Internal Server Error");
            }
            return res.json(results);
        });
    }
    else {
        db.query('SELECT * FROM LikeDislike WHERE VideoPostId = ?', [VideoPostId], (err, results)=>{
            if(err) {
                console.log(err)
                res.status(500).send("Internal Server Error");
            }
            return res.json(results);
        });
    }
})


app.post("/forumCreate", async (req,res)=>{
    const title = req.body.title
    const description = req.body.description 
    db.query("INSERT INTO forums(title, description) VALUES(?, ?)", [title, description],(err)=>{
        if(err){
            if(err.errno === 1062){
                res.status(500).send("This forum already exists.")
            }
            else{
                res.send(err)
            }
        } 
        return res.status(201).send("Forum created successfully")
    })
})

app.get("/forums", (req,res)=>{
    const query = "SELECT * FROM forums"
    db.query(query,(err,data)=>{
        if(err){
            res.send(err)
        }
        return res.json(data)
    })
})

app.get("/UserPosts", async (req,res)=>{
    const username = req.query.username
    console.log(username)
    db.query('SELECT * FROM forumpost WHERE username = ?', [username], (err, data)=>{
        if(err){
            res.send(err)
        }
        return res.json(data)
    })
})

/*
- add new post
- recalculate tfidf vector for previous posts
- 
*/
app.post("/forumPostCreate", async (req, res) => {
    const allPosts = req.body.allPosts
    const username = req.body.username
    const title = req.body.title
    const body = req.body.body
    const forums = req.body.forums.join(", ")
    const tfidfVector = {}

    //add all previous posts to the corpus
    allPosts.forEach(post => {
        var tokenedPreviousPost = tokenizer.tokenize(post.body)
        tokenedPreviousPost = stopwords.removeStopwords(tokenedPreviousPost, enStopwords)
        tfidf.addDocument(tokenedPreviousPost)
        tfidf.documents[tfidf.documents.length - 1].__key = post.id //key for idenfying which post is from
    });

    //add current post to the corpus
    var tokenedCurrentPost = tokenizer.tokenize(body)
    tokenedCurrentPost = stopwords.removeStopwords(tokenedCurrentPost, enStopwords)
    tfidf.addDocument(tokenedCurrentPost)

    //recalculate previous post tfidf vector
    for(i = 0; i < tfidf.documents.length; i++){
        let pastTfidfVector = {}
        tfidf.listTerms(i).forEach(function(item){
            pastTfidfVector[item.term] = item.tfidf
        })
        const stringTfidfVector = JSON.stringify(pastTfidfVector)
        db.query('UPDATE forumpost SET tfidf_vector=? WHERE id=?', [stringTfidfVector, tfidf.documents[i].__key], function(err){
            if(err){
                console.log(err)
                res.status(500).send(err)
            }
            else{
                console.log("COMPLETE")
            }
        })
    }
    
    //calculate currnent post tfidf vector
    tfidf.listTerms(tfidf.documents.length - 1).forEach(function(item) {
        tfidfVector[item.term] = item.tfidf
    });

    //update tfidf vector for previous posts
    //add current post to database
    const tfidfVectorString = JSON.stringify(tfidfVector)
    db.query('INSERT INTO ForumPost(username, title, body, post_timestamp, forums, tfidf_vector) VALUES (?, ?, ?, NOW(), ?, ?)', [username, title, body, forums, tfidfVectorString], function(err, insertResult) {
        if(err){
            console.log(err)
            res.status(500).send(err)
        }
        else{
            const postID = insertResult.insertId
            return res.status(201).send({
                username: username, 
                title: title, 
                body: body, 
                id: postID,
                forums: forums
            })
        }
    })
})

function updateTFI_DFVector(allPosts){

}
//viewing all posts, mainly for testing purposes can change the condition later
app.get("/forumPostsAll", async (req,res)=>{
    db.query('SELECT * FROM forumpost', (err, data)=>{
        if(err){
            res.send(err)
        }
        return res.json(data)
    })
})

//viewing a post by its id
app.get("/forumPostsById/:postID", async (req,res)=>{
    const id = parseInt(req.params.postID, 10)
    console.log(typeof(id))
    console.log(id)
    db.query('SELECT * FROM forumpost WHERE id=?', [id], (err, data)=>{
        if(err){
            res.send(err)
        }
        console.log(data)
        console.log("hi")
        return res.json(data)
    })
})

app.delete("/forumPostDelete/:id", (req,res)=>{
    const forumPostID = req.params.id
    const query = "DELETE FROM forumpost WHERE id = ?"
    db.query(query, [forumPostID], (err,data)=>{
        if (err) return res.send(err)
        return res.json("Post has been deleted successfully");
    });
});

//gets forum posts liked by a user
app.get("/forumPostsLikedByUser/", async (req,res)=>{
    const userID = req.query.userID
    const forumPostID = req.query.postID
    const query = "SELECT * FROM ForumPostLikeDislike WHERE forumPostID = ? AND userID = ? AND LikeStatus = 1"
    db.query(query, [forumPostID, userID], (err,data)=>{
        if (err) return res.send(err)
        return res.json(data);
    });
});

//gets forum posts disliked by a user
app.get("/forumPostsDislikedByUser/", async (req,res)=>{
    const userID = req.query.userID
    const forumPostID = req.query.postID
    const query = "SELECT * FROM ForumPostLikeDislike WHERE forumPostID = ? AND userID = ? AND LikeStatus = 0"
    db.query(query, [forumPostID, userID], (err,data)=>{
        if (err) return res.send(err)
        return res.json(data);
    });
});

//gets likes from post
app.get("/fetchAllForumPostLikes/", async(req,res)=>{
    //holds number of likes for each post
    const forumPostID = req.query.postID
    const queryLikes = "SELECT * FROM ForumPostLikeDislike WHERE forumPostID = ? AND LikeStatus = 1"
        db.query(queryLikes, [forumPostID], (err, data)=>{
            if (err){
                return res.send("error")
            }
            else { 
                return res.json(data)
            }
        });
});

//gets dislikes from post
app.get("/fetchAllForumPostDislikes/", async(req,res)=>{
    //holds number of dislikes for each post
    const forumPostID = req.query.postID
    const queryLikes = "SELECT * FROM ForumPostLikeDislike WHERE forumPostID = ? AND LikeStatus = 0"
        db.query(queryLikes, [forumPostID], (err, data)=>{
            if (err){
                return res.send("error");
            }
            else { 
                return res.json(data)
            }
        })
})

//Gets posts that has a dislike/like in db by user
app.get("/forumPostLikeStatus/", async (req,res)=>{
    const forumPostID = req.query.postID
    const userID = req.query.userID
    const check = "SELECT * FROM ForumPostLikeDislike WHERE forumPostID = ? AND UserID = ?"
    db.query(check, [forumPostID, userID], (err,data)=>{
        if (err){
            return res.send("error");
        }
        else { 
            return res.json(data)
        }
    });
});

//Posts a like/dislike with user and post
app.post("/forumPostLikeDislike/", async (req,res)=>{
    const forumPostID = req.query.postID
    const userID = req.query.userID
    const rating = req.query.rating
    const query = "INSERT INTO ForumPostLikeDislike (ForumPostID, UserID, LikeStatus) VALUES (?, ?, ?)"
    db.query(query, [forumPostID, userID, rating], (err, data) => {
        if (err) {
            return res.status(500).send("Internal Server Error")
        } else {
            return res.status(201).send("Like/Dislike Successful!")
        }
    });
});

//Changes like to dislike and vice versa with user and post
app.put("/forumPostChangeLikeDislike/", async (req,res)=>{
    const LikeDislikeID = req.query.LikeDislikeID
    const rating = req.query.rating
    const query = "UPDATE ForumPostLikeDislike SET LikeStatus = ? WHERE LikeDislikeID = ?"
    db.query(query, [rating, LikeDislikeID], (err, data) => {
        if (err) {
            return res.status(500).send("Internal Server Error")
        } else {
            return res.status(201).send("Like/Dislike Update Successful!")
        }
    });
});

//Deletes like/dislike from database
app.delete("/forumPostDeleteLikeDislike/", async (req,res)=>{
    const LikeDislikeID = req.query.LikeDislikeID
    const query = "DELETE FROM ForumPostLikeDislike WHERE LikeDislikeID = ?"
    db.query(query, [LikeDislikeID], (err, data) => {
        if (err) {
            return res.status(500).send("Internal Server Error")
        } else {
            return res.status(201).send("Like/Dislike Update Successful!")
        }
    });
});

app.post("/forumPostComment/:id", (req, res) => {
   const forumPostID = parseInt(req.params.id, 10)
   //debugging purposes
   const username = req.body.username
   const body = req.body.body

   db.query("INSERT INTO forumpostcomments(forum_post_id, username, body, comment_timestamp) VALUES (?, ?, ?, NOW())", [forumPostID, username, body], function (err){
    if(err){
        console.log(err)
    }else{
        return res.status(201).send("Comment Successful")
    }
   })
})

//gets likes from comment
app.get("/fetchAllForumPostCommentLikes/", async(req,res)=>{
    //holds number of likes for each post
    const forumPostCommentID = req.query.commentID
    const queryLikes = "SELECT * FROM ForumPostCommentLikeDislike WHERE forumPostCommentID = ? AND LikeStatus = 1"
        db.query(queryLikes, [forumPostCommentID], (err, data)=>{
            if (err){
                return res.send("error")
            }
            else { 
                return res.json(data)
            }
        });
});

//gets dislikes from comment
app.get("/fetchAllForumPostCommentDislikes/", async(req,res)=>{
    //holds number of dislikes for each post
    const forumPostCommentID = req.query.commentID
    const queryDislikes = "SELECT * FROM ForumPostCommentLikeDislike WHERE forumPostCommentID = ? AND LikeStatus = 0"
        db.query(queryDislikes, [forumPostCommentID], (err, data)=>{
            if (err){
                return res.send("error");
            }
            else { 
                return res.json(data)
            }
        })
})

//Gets post's comments that has a dislike/like in db by user
app.get("/forumPostCommentLikeStatus/", async (req,res)=>{
    const forumPostCommentID = req.query.commentID
    const userID = req.query.userID
    const check = "SELECT * FROM ForumPostCommentLikeDislike WHERE forumPostCommentID = ? AND UserID = ?"
    db.query(check, [forumPostCommentID, userID], (err,data)=>{
        if (err){
            return res.send("error");
        }
        else { 
            return res.json(data)
        }
    })
})

//Posts a like/dislike with user and comment
app.post("/forumPostCommentLikeDislike/", async (req,res)=>{
    const forumPostCommentID = req.query.commentID
    const userID = req.query.userID
    const rating = req.query.rating
    const query = "INSERT INTO ForumPostCommentLikeDislike (forumPostCommentID, UserID, LikeStatus) VALUES (?, ?, ?)"
    db.query(query, [forumPostCommentID, userID, rating], (err, data) => {
        if (err) {
            return res.status(500).send("Internal Server Error")
        } else {
            return res.status(201).send("Like/Dislike Successful!")
        }
    });
});

//Changes like to dislike and vice versa with user and comment
app.put("/forumPostCommentChangeLikeDislike/", async (req,res)=>{
    const LikeDislikeID = req.query.LikeDislikeID
    const rating = req.query.rating
    const query = "UPDATE ForumPostCommentLikeDislike SET LikeStatus = ? WHERE LikeDislikeID = ?"
    db.query(query, [rating, LikeDislikeID], (err, data) => {
        if (err) {
            return res.status(500).send("Internal Server Error")
        } else {
            return res.status(201).send("Like/Dislike Update Successful!")
        }
    });
});

//Deletes like/dislike from database
app.delete("/forumPostCommentDeleteLikeDislike/", async (req,res)=>{
    const LikeDislikeID = req.query.LikeDislikeID
    const query = "DELETE FROM ForumPostCommentLikeDislike WHERE LikeDislikeID = ?"
    db.query(query, [LikeDislikeID], (err, data) => {
        if (err) {
            return res.status(500).send("Internal Server Error")
        } else {
            return res.status(201).send("Like/Dislike Update Successful!")
        }
    });
});

//gets forum comments liked by a user
app.get("/forumPostCommentsLikedByUser/", async (req,res)=>{
    const userID = req.query.userID
    const forumPostCommentID = req.query.commentID
    const query = "SELECT * FROM ForumPostCommentLikeDislike WHERE forumPostCommentID = ? AND userID = ? AND LikeStatus = 1"
    db.query(query, [forumPostCommentID, userID], (err,data)=>{
        if (err) return res.send(err)
        return res.json(data);
    });
});

//gets forum comments disliked by a user
app.get("/forumPostCommentsDislikedByUser/", async (req,res)=>{
    const userID = req.query.userID
    const forumPostCommentID = req.query.commentID
    const query = "SELECT * FROM ForumPostCommentLikeDislike WHERE forumPostCommentID = ? AND userID = ? AND LikeStatus = 0"
    db.query(query, [forumPostCommentID, userID], (err,data)=>{
        if (err) return res.send(err)
        return res.json(data);
    });
});

app.get("/forumPostParentCommentGetByID/:id", (req, res) =>{
    const forumPostID = parseInt(req.params.id, 10)
    db.query("SELECT * FROM forumpostcomments WHERE forum_post_id=? AND parent_comment_id IS NULL", [forumPostID], function (err, data){
    if(err){
        console.log(err)
    }
    return res.json(data)
    })
})

app.post("/forumPostCommentReply/:id/:commentID", (req, res) =>{
    const forumPostID = parseInt(req.params.id, 10)
    const commentID = parseInt(req.params.commentID, 10)
    const username = req.body.username
    const body = req.body.body
    const timestamp = new Date().toISOString()

    console.log("FORUM POST COMMENT REPLY FOR POST " + forumPostID)
    console.log("TYPE OF FORUM POST ID " + typeof(forumPostID))
    console.log("PARENT COMMENT " + commentID)
    console.log()
    const reply = {
        username,
        body,
        timestamp
    }
    const insertQuery = "INSERT INTO forumpostcomments(forum_post_id, username, body, comment_timestamp, parent_comment_id) VALUES (?, ?, ?, NOW(),?)"

           db.query(insertQuery, [forumPostID, username, body, commentID], (err, insertResult) =>{
            if(err){
                console.log(err)
            }
            else{
                const replyID = insertResult.insertId
                const selectQuery = "SELECT username from forumpostcomments where id=?"
                db.query(selectQuery, [replyID], (err, selectResult) => {
                    if(err){
                        console.log(err)
                    }
                    else
                    {
                        const replyUsername = selectResult[0].username
                        console.log("USERNAME: " + replyUsername)
                        return res.status(201).send({id: replyID, username: replyUsername, message:"Reply Successful"})
                    }
                })
            }
           })
})

app.get("/forumPostParentGetReplies/:id/:commentID", (req, res) =>{
    const forumPostID = parseInt(req.params.id, 10)
    const parentCommentID = parseInt(req.params.commentID, 10)

    if(isNaN(parentCommentID)){
        return;
    }

    db.query("SELECT * FROM forumpostcomments WHERE parent_comment_id=?", [parentCommentID], function (err, data){
    if(err){
        console.log(err)
    }
    else{
        return res.json(data)
    }
    })
})

app.get("/forumPostSearch/:searchTitle", (req, res) => {
    const searchTitle = req.params.searchTitle
    db.query("SELECT * FROM forumpost WHERE title LIKE ?",['%' + searchTitle + '%'], function (err, data){
        if(err){
            console.log(err)
        }
        else{
            return res.json(data)
        }
    })
})

/*
to see if a post should be recommended, take the consine similarity of the tfidf_vector
if it meets the threshold, recommend it
*/

app.get("/forumPostRecommendedPost/:postID", (req, res) =>{
    const postID = req.params.postID
    const recommendedPosts = []
    db.query("SELECT * from forumpost WHERE ID=?", [postID], function(err, data){
        if(err){
            console.log(err)
        }
        else{
            const post = data[0]
            console.log(post)
            db.query("SELECT * from forumpost WHERE ID!=?", [postID], function(err, data){
                if(err){
                    console.log(err)
                }
                else{
                    const similarityThreshold = 0.10
                    data.forEach(otherPost =>{
                        if(cosineSimilarity(post.tfidf_vector, otherPost.tfidf_vector) >= similarityThreshold){
                            recommendedPosts.push(otherPost)
                            console.log(recommendedPosts)
                        }
                    })
                    return res.status(201).send({recommendedPosts: recommendedPosts})
                }
            })
            
        }
    })
})

function cosineSimilarity(tfidfVector1, tfidfVector2) {
    const parsedVector1 = JSON.parse(tfidfVector1)
    const parsedVector2 = JSON.parse(tfidfVector2)

    let dotProduct = 0
    for(let term in parsedVector1){
        if(parsedVector2.hasOwnProperty(term)){
            dotProduct += (parsedVector1[term] * parsedVector2[term])
        }
    }

    const magnitude1 = Math.sqrt(
        Object.values(parsedVector1).reduce((acc, val) => acc + val ** 2, 0)
    );

    const magnitude2 = Math.sqrt(
        Object.values(parsedVector2).reduce((acc, val) => acc + val ** 2, 0)
    );

    return dotProduct / (magnitude1 * magnitude2).toFixed(2)
}


  app.get("/videoComments/:VideoPostId", (req,res)=>{
    const VideoPostId= req.params.VideoPostId;
    db.query('SELECT * FROM VideoPostComments WHERE VideoPostId = ?',[VideoPostId], (err, results)=>{
        if(err) {
            console.log(err)
            return res.status(500).send("Internal Server Error");
        }
        return res.json(results);
    });
  })

  app.put("/videoComments/:VideoPostCommentId", (req,res)=>{
    const VideoPostCommentId = req.params.VideoPostCommentId;
    const {updatedComment}= req.body;
    db.query('UPDATE VideoPostComments SET Comment= ? WHERE VideoPostCommentId =?', [updatedComment, VideoPostCommentId], (err, results)=>{
        if(err) {
            console.log(err)
            return res.status(500).send("Internal Server Error");
        }
        return res.json(results);
    })
  })

  app.post("/videoComments", (req,res)=>{
    const {UserId, Comment, VideoPostId, ReplyToVideoPostCommentId}= req.body;
    if(ReplyToVideoPostCommentId!==null){
        db.query('SELECT * FROM VideoPostComments WHERE VideoPostCommentId = ?', [ReplyToVideoPostCommentId], (err, results)=>{
            if(err){
                console.log(err)
                return res.status(500).send("Internal Server Error")
            }
            if(results[0].DELETED){
                return res.status(400).send("You cannot reply to a deleted comment");
            }
            db.query('INSERT INTO VideoPostComments (UserId, Comment, VideoPostId, ReplyToVideoPostCommentId, DELETED) VALUES (?, ?, ?, ?, ?)', [UserId, Comment, VideoPostId, ReplyToVideoPostCommentId, false], (err1, results1)=>{
                if(err1){
                    console.log(err1)
                    return res.status(500).send("Internal Server Error");
                }
                return res.json(results1);
            })
        })
    }
    else {
        db.query('INSERT INTO VideoPostComments (UserId, Comment, VideoPostId, ReplyToVideoPostCommentId, DELETED) VALUES (?, ?, ?, ?, ?)', [UserId, Comment, VideoPostId, ReplyToVideoPostCommentId, false], (err1, results1)=>{
            if(err1){
                console.log(err1)
                return res.status(500).send("Internal Server Error");
            }
            return res.json(results1);
        })
    }
    

  })

  app.post("/videoCommentRating", (req, res)=>{
    const {VideoPostCommentId, UserId, LikeStatus}= req.body;
    db.query('INSERT INTO VideoPostCommentLikeDislike (VideoPostCommentId, UserId, LikeStatus) VALUES (?, ?, ?)', [VideoPostCommentId, UserId, LikeStatus], (err, results)=>{
        if(err){
            console.log(err);
            return res.status(500).send("Internal Server Error");
        }
        return res.status(201).send("Successfully added Video Comment Rating")
    })
  })

  app.get("/videoCommentRating", (req, res)=>{
        const {VideoPostCommentId, UserId} = req.query;
        db.query("SELECT * FROM VideoPostCommentLikeDislike WHERE UserId= ? AND VideoPostCommentId = ?", [UserId, VideoPostCommentId], (error, results)=>{
            if (error){
                console.log(error);
                return res.status(500).send("Internal Server Error");
            }
            return res.json(results);
        })
  })

  app.post("/friendRequests", (req, res)=>{
    const {SenderUserId, ReceiverUserId}= req.body;
    
    let theQuery= "SELECT * FROM FriendRequests WHERE SenderUserId = ? AND ReceiverUserId = ?"
    let theArray= [ReceiverUserId, SenderUserId];
    db.query(theQuery, theArray, (error, results)=>{
        if(error){
            console.log(error)
            return res.status(500).send("Internal Server Error");
        }
        if(results.length>0){
            return res.status(400).send("You already have a pending friend request from this person")
        }
        else {
            theQuery= "INSERT INTO FriendRequests (SenderUserId, ReceiverUserId) VALUES (?, ?)"
            
            theArray=[SenderUserId, ReceiverUserId];
            queryTheDatabase(theQuery, theArray, res);
        }
    })
  })

  app.delete("/friendRequests", (req,res)=>{
    const {SenderUserId, ReceiverUserId}= req.query;
    queryTheDatabase("DELETE FROM FriendRequests WHERE SenderUserId = ? AND ReceiverUserId = ?",[SenderUserId, ReceiverUserId], res)
  })

  app.post("/Friendships", (req, res)=>{
    const {UserId1, UserId2}= req.body
    let val1, val2;
    if(UserId1>UserId2){
        val1= UserId2
        val2= UserId1
    }
    else{
        val1=UserId1
        val2=UserId2
    }
    queryTheDatabase("INSERT INTO Friendships (UserId1, UserId2) VALUES (?, ?)", [val1, val2], res)
  })
  app.delete("/Friendships", (req, res)=>{
    const {UserId1, UserId2}= req.query
    let val1, val2;
    if(UserId1>UserId2){
        val1= UserId2
        val2= UserId1
    }
    else{
        val1=UserId1
        val2=UserId2
    }
    queryTheDatabase("DELETE FROM Friendships WHERE UserId1= ? AND UserId2 = ?", [val1, val2], res)
  })

  app.get("/OutgoingFriendRequests/:UserId", (req,res)=>{
    const UserId = req.params.UserId
    queryTheDatabase("SELECT * FROM FriendRequests WHERE SenderUserId = ?", [UserId], res);
  })
  app.get("/IncomingFriendRequests/:UserId", (req,res)=>{
    const UserId = req.params.UserId
    queryTheDatabase("SELECT * FROM FriendRequests WHERE ReceiverUserId = ?", [UserId], res);
  })
  app.get("/ListOfFriends/:UserId", (req, res)=>{
    const UserId = req.params.UserId
    queryTheDatabase("SELECT * FROM Friendships WHERE UserId1 = ? OR UserId2 = ?", [UserId,UserId], res)
  })

  app.get("/FriendRelationship", (req,res)=>{
    const {LoggedInUserId, VisitorUserId}= req.query;
    let val1, val2;
    if(LoggedInUserId>VisitorUserId){
        val1=VisitorUserId;
        val2=LoggedInUserId;
    }
    else{
        val1=LoggedInUserId;
        val2=VisitorUserId;
    }
    db.query("SELECT * FROM Friendships WHERE UserId1 = ? && UserId2 = ?", [val1, val2], (err, results)=>{
        if (err){
            console.log(err);
            return res.status(500).send("Internal Server Error");
        }
        else if(results.length>0){
            return res.send(results);
        }
        db.query("SELECT * FROM FriendRequests WHERE SenderUserId = ? && ReceiverUserId = ?", [val1,val2], (err1,results1)=>{
            if(err1){
                console.log(err1);
                return res.status(500).send("Internal Server Error");
            }
            else if(results1.length>0){
                return res.send(results1);
            }
            db.query("SELECT * FROM FriendRequests WHERE SenderUserId = ? && ReceiverUserId = ?", [val2,val1], (err2,results2)=>{
                if(err2){
                    console.log(err2);
                    return res.status(500).send("Internal Server Error");
                }
                return res.send(results2);
            })
        })
    })
    
  })

  app.post('/video-genre', (req,res)=>{
    const {VideoPostId, Genre}= req.body
    db.query('SELECT * FROM Genre Where Genre = ?', [Genre.toLowerCase()], (err, results)=>{
        if(err){
            console.log(err)
            res.status(500).send("Something went wrong in selecting from genres")
        }
        else {
            if(results.length===1){
                queryTheDatabase("INSERT INTO VideoPostGenre (VideoPostId, GenreId) VALUES (?, ?)", [VideoPostId, results[0].GenreId], res)
            }
            else if(results.length===0){
                db.query(`INSERT INTO Genre (Genre) VALUES (?)`, [Genre.toLowerCase()], (err1, results1)=>{
                    if(err1){
                        console.log(err1)
                        res.status(500).send("Something went wrong in creating new genre");
                    }
                    else {
                        queryTheDatabase("INSERT INTO VideoPostGenre (VideoPostId, GenreId) VALUES (?, ?)", [VideoPostId, results1.insertId], res)
                    }
                } )
            }
        }
    })
  })

  app.get("/genreName", (req, res)=>{ //fix this and add video later
    const {GenreId} = req.query;
    queryTheDatabase("SELECT * FROM Genre WHERE GenreId = ?", [GenreId], res);
  })

  app.get("/email", (req, res)=>{
    const {UserId} = req.query;
    queryTheDatabase("SELECT email FROM users WHERE id = ?", [UserId], res)
  })
  app.put("/email", (req, res)=>{
    const {UserId, email} = req.body;
    queryTheDatabase("UPDATE users SET email = ? WHERE id = ?", [email, UserId], res)
  })

  app.get("/videoSubscriptionOnly", (req, res)=>{
    const {UserId} = req.query;
    queryTheDatabase("SELECT * FROM VideoSubscriptionOnly WHERE UserId = ?", [UserId], res)
  })
  app.delete("/videoSubscriptionOnly", (req,res)=>{
    const {UserId}= req.query;
    queryTheDatabase("DELETE FROM VideoSubscriptionOnly WHERE UserId = ?", [UserId], res);
  })
  app.post("/videoSubscriptionOnly", (req, res)=>{
    const {UserId, Only}=req.body;
    queryTheDatabase("INSERT INTO VideoSubscriptionOnly (UserId, Only) VALUES (?,?)", [UserId, Only], res);
  })

  app.get("/videoSubscriptions", (req, res)=>{
    const {UserId} = req.query;
    queryTheDatabase("SELECT * FROM VideoSubscriptions WHERE UserId = ?", [UserId], res);
  })

  app.delete("/videoSubscriptions", (req,res)=>{
    const {UserId} = req.query;
    queryTheDatabase("DELETE FROM VideoSubscriptions WHERE UserId = ?", [UserId], res);
  })
  app.post("/videoSubscriptions", (req,res)=>{
    const {UserId, Genre}=req.body;
    db.query('SELECT * FROM Genre Where Genre = ?', [Genre.toLowerCase()], (err, results)=>{
        if(err){
            console.log(err)
            res.status(500).send("Something went wrong in selecting from genres")
        }
        else {
            if(results.length===1){
                queryTheDatabase("INSERT INTO VideoSubscriptions (UserId, GenreId) VALUES (?, ?)", [UserId, results[0].GenreId], res)
            }
            else if(results.length===0){
                db.query(`INSERT INTO Genre (Genre) VALUES (?)`, [Genre.toLowerCase()], (err1, results1)=>{
                    if(err1){
                        console.log(err1)
                        res.status(500).send("Something went wrong in creating new genre");
                    }
                    else {
                        queryTheDatabase("INSERT INTO VideoSubscriptions (UserId, GenreId) VALUES (?, ?)", [UserId, results1.insertId], res)
                    }
                } )
            }
        }
    })
  })
  const authenticateUserForChat = (socket, next)=>{
    const token= socket.handshake.query.token;
    if (!token) {
        return next(new Error('Authentication error: Token missing'));
    }
    jwt.verify(token, secretKey, (err, value)=>{
        if(err){
            return next(new Error('Authentication error: Invalid token'));
        }
        else{
            socket.request.user= {username:value.username};
            db.query("SELECT * FROM users WHERE username = ?", [value.username], (error1, results1)=>{
                if(error1){
                    console.log(error1)
                }
                else{
                    socket.request.user.UserId = results1[0].id;
                    next();
                }
            })    
        }
    })
  }
  io.use(authenticateUserForChat);


  const queryTheDatabaseWithCallback= (theQuery, theArray, res, callback)=>{
    db.query(theQuery, theArray, (error, results)=>{
        if(error){
            console.log(error)
            res.status(500).send("Internal Server Error");
        }
        callback(results)
    })
  }
  
  io.on('connection', (socket) => {
    console.log(`A user connected ${socket.id}`);
    const {UserId}= socket.request.user;

    socket.join(`UserId_${UserId}`);

    socket.on('disconnect', () => {

        console.log(`User disconnected ${socket.id}`);

        socket.leave(`UserId_${UserId}`);
    });
  });


  app.post("/chatMessage", (req, res)=>{
    const {SenderUserId, ReceiverUserId, Message} = req.body;
    queryTheDatabaseWithCallback("INSERT INTO ChatMessage (SenderUserId, ReceiverUserId, Message) VALUES (?,?,?)", [SenderUserId, ReceiverUserId, Message], res, (results)=>{
        io.to(`UserId_${ReceiverUserId}`).emit("newMessage", { SenderUserId, ReceiverUserId, Message, ChatMessageId:results.insertId, SentAt:new Date().toISOString()});
        res.send(results);
    }); 
  })

  app.get("/chatMessages", (req, res)=>{
    const {UserId1, UserId2} = req.query;
    queryTheDatabaseWithCallback("SELECT * FROM ChatMessage WHERE (SenderUserId = ? AND ReceiverUserId = ?) OR (SenderUserId = ? AND ReceiverUserId = ?) ORDER BY SentAt", [UserId1, UserId2, UserId2, UserId1], res, (results)=>{
        res.send(results)
    });
  })

  server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
