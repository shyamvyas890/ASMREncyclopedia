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
                db.query(`INSERT INTO Genre (Genre) VALUES (?)`, [Genre], (err1, results1)=>{
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
                db.query(`INSERT INTO Genre (Genre) VALUES (?)`, [Genre], (err1, results1)=>{
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
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });