const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
const cors= require("cors");

const app = express();
const port = 3001;
const secretKey= "secret_key" //Will change this later
app.use(express.json())
app.use(express.urlencoded({ extended: true })); // Might not need this
app.use(cors());
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'ASMR_DB',
  });
  db.connect((err) => {
    if (err) {
      console.error('Error connecting to MySQL:', err);
    } else {
      console.log('Connected to MySQL');
    }
  });
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

  app.post('/video/:VideoId', (req,res)=>{
    const VideoLinkId= req.params.VideoId;
    const {UserId, Title} = req.body
    db.query('INSERT INTO VideoPost (UserId, Title, VideoLinkId) VALUES (?, ?, ?)', [UserId, Title, VideoLinkId], (err)=>{
        if(err){
            console.log(err);
            res.status(500).send("Error adding video");
        }
        else {
            res.status(201).send("Successfully added video");
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
        db.query('INSERT INTO Genre (Genre) VALUES (?)', [genre], (err)=>{
            if(err){
                console.log(err)
                res.status(500).send("Error adding genre")
            }
            else {
                res.status(201).send("Successfully added genre");
            }
        })
  })

  app.post('/video-genre', (req,res)=>{
        const {VideoPostId, GenreId}= req.body
        db.query('INSERT INTO VideoPostGenre (VideoPostId, GenreId) VALUES (?, ?)', [VideoPostId, GenreId], (err)=>{
            if(err){
                console.log(err)
                res.status(500).send("Error adding genre to this video")
            }
            else {
                res.status(201).send("Successfully added genre to this video");
            }
        })
  })


  

  app.get('/users/id', (req, res)=> {
        const {username, UserId}= req.query
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
    const {id, VideoPostId, LikeDislikeId, GenreId, VideoPostGenreId}= req.query
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
    else {
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

app.post("/forumPostCreate", async (req, res) => {
    console.log(req.body) //for debugging
    const username = req.body.username
    const title = req.body.title
    const body = req.body.body
    const forums = req.body.forums //currently only selecting 1 forum
    
    db.query('INSERT INTO ForumPost(username, title, body, post_timestamp, forums) VALUES (?, ?, ?, NOW(), ?)', [username, title, body, forums], function(err) {
        if(err){
            console.log(err)
            res.status(500).send(err)
        }
        else{
            return res.status(201).send("Post Successful!")
        }
    })
})


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
app.get("/forumPostsById/:id", async (req,res)=>{

    const id = parseInt(req.params.id, 10)
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
    const forumPostID = req.params.id;
    const query = "DELETE FROM forumpost WHERE id = ?"

    db.query(query, [forumPostID], (err,data)=>{
        if (err) return res.send(err);
        return res.json("Post has been deleted successfully");
    });
});

app.post("/forumPostComment/:id", (req, res) => {
   const forumPostID = parseInt(req.params.id, 10)
   //debugging purposes
   console.log(forumPostID)
   console.log(typeof(forumPostID))
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

app.get("/forumPostParentCommentGetByID/:id", (req, res) =>{
    const forumPostID = parseInt(req.params.id, 10)
    //debugging purposes
    console.log(forumPostID)
    console.log(typeof(forumPostID))
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

    const reply = {
        username,
        body,
        timestamp
    }
    const insertQuery = "INSERT INTO forumpostcomments(forum_post_id, username, body, comment_timestamp, parent_comment_id) VALUES (?, ?, ?, NOW(),?)"

           db.query(insertQuery, [forumPostID, username, body, commentID], (err) =>{
            if(err){
                console.log(err)
            }
            else{
                return res.status(201).send("Reply Successful")
            }
           })
})

app.get("/forumPostParentGetReplies/:id/:commentID", (req, res) =>{
    const forumPostID = parseInt(req.params.id, 10)
    const parentCommentID = parseInt(req.params.commentID, 10)
    //debugging purposes
    console.log(forumPostID)
    console.log(typeof(forumPostID))
    console.log(parentCommentID)
    db.query("SELECT * FROM forumpostcomments WHERE parent_comment_id=?", [parentCommentID], function (err, data){
    if(err){
        console.log(err)
    }
    else{
        return res.json(data)

    }
    })
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});