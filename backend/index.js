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
const cookieParser = require('cookie-parser');
const port = 3001;
const secretKey= "secret_key" //Will change this later

var natural = require('natural');
var TfIdf = natural.TfIdf;
var tfidf = new TfIdf();
var tokenizer = new natural.WordTokenizer()
var stopwords = require('stopword');
const { constrainedMemory } = require('process');
const { verify } = require('crypto');
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
app.use(cookieParser());
app.use(express.json())
app.use(express.urlencoded({ extended: true })); // Might not need this
app.use(cors({
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    secure:false
}));
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
const queryTheDatabaseGiveResults = (theQuery, theArray)=>{
    return new Promise ((resolve, reject)=>{
        db.query(theQuery, theArray, (error, results)=>{
            if(error){
                reject(error)
            }
            else {
                resolve(results);
            }
        })
    })
}
app.post("/register", async (req,res)=>{
    const { username, password } = req.body;
    if(username === ""){
        return res.status(400).send("Username cannot be empty")
    }
    if(password === ""){
        return res.status(400).send("Password cannot be empty")
    }
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

const authenticateUser = (socket, next)=>{
    let token= socket.handshake.headers.cookie
    if (!token) {
        return next(new Error('Authentication error: Token missing'));
    }
    token=token.split("=")[1];
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
io.use(authenticateUser);

const verifyJWTMiddleware = (req,res,next)=>{
    const submittedToken = req.cookies['theJWTToken'];
    if(!submittedToken){
        return res.status(401).send("No token provided");
    }
    db.query('SELECT * FROM blacklisted_tokens WHERE token = ?', [submittedToken], (error, results)=>{
        if(error){
            console.log(error);
        }
        else if(results.length>0){
            return res.status(401).send("Token is blacklisted");  
        }
        try {
            const decodedToken = jwt.verify(submittedToken, secretKey);
            req.decodedToken = decodedToken;
            next();
        }
        catch(error) {
            return res.status(401).send("Token is invalid");
        }

    })
}

async function whoOwnsThis(item, itemValue){
    if(item === "VideoPostId"){
        return await queryTheDatabaseGiveResults("SELECT UserId FROM VideoPost WHERE VideoPostId = ?", [itemValue]);
    }
    else if (item === "LikeDislikeId"){
        return await queryTheDatabaseGiveResults("SELECT UserId FROM LikeDislike WHERE LikeDislikeId = ?", [itemValue]);
    }
    else if (item === "ForumPostId"){
        return await queryTheDatabaseGiveResults("SELECT username FROM ForumPost WHERE id = ?", [itemValue]);

    }
    else if (item === "ForumPostLikeDislikeID"){
        return await queryTheDatabaseGiveResults("SELECT UserID FROM ForumPostLikeDislike WHERE LikeDislikeID = ?", [itemValue]);
    }

    else if(item === "ForumPostCommentId"){
        return await queryTheDatabaseGiveResults("SELECT username FROM ForumPostComments WHERE id=?", [itemValue])
    }

    else if (item === "ForumPostCommentLikeDislikeId"){
        return await queryTheDatabaseGiveResults("SELECT UserID FROM ForumCommentLikeDislike WHERE LikeDislikeID = ?", [itemValue]);
    }
    else if (item === "VideoPostCommentId"){
        return await queryTheDatabaseGiveResults("SELECT UserId FROM VideoPostComments WHERE VideoPostCommentId = ?", [itemValue]);

    }
    else if (item === "VideoPostCommentLikeDislikeId"){
        return await queryTheDatabaseGiveResults("SELECT UserId FROM VideoPostCommentLikeDislikeId WHERE VideoPostCommentLikeDislikeId = ?", [itemValue]);

    }
    else if (item === "FriendRequestId"){
        // return await queryTheDatabaseGiveResults("SELECT UserId FROM VideoPost WHERE VideoPostId = ?", [itemValue]);

    }
    else if (item === "VideoSubscriptionOnlyId"){
        // return await queryTheDatabaseGiveResults("SELECT UserId FROM VideoPost WHERE VideoPostId = ?", [itemValue]);

    }
    else if (item === "ChatMessageId"){
        // return await queryTheDatabaseGiveResults("SELECT UserId FROM VideoPost WHERE VideoPostId = ?", [itemValue]);

    }
    else if (item === "PlaylistID"){
        return await queryTheDatabaseGiveResults("SELECT UserID FROM Playlist WHERE PlaylistID = ?", [itemValue]);
    }
    else if (item === "PlaylistVideoPostsID"){
        return await queryTheDatabaseGiveResults("SELECT UserID FROM PlaylistVideoPosts WHERE PlaylistVideoPostsID = ?", [itemValue]);

    }
}




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
app.put("/changePassword",
     verifyJWTMiddleware, 
    (req,res,next)=>{
        const username = req.body.username;
        if(username !== req.decodedToken.username){
            return res.status(403).send("You do not have permission to do that");
        }
        next();
    },
    async (req, res)=>{
        const {username, oldPassword, newPassword}= req.body;
        db.query(
            'SELECT * FROM users WHERE username = ?',
            [username],
            async (err, results) => {
                if(err){
                    console.log(err);
                    res.status(500).send("Error logging in.")
                }
                else if (results.length>0){
                    const match = await bcrypt.compare(oldPassword, results[0].password);
                    if (match) {
                        const hashedPassword = await bcrypt.hash(newPassword, 13);
                        queryTheDatabase("UPDATE users SET password = ? WHERE username= ? ", [hashedPassword,username], res);
                    } 
                    else {
                        res.status(401).send('Your password is incorrect.');

                    }
                }
                else {
                    res.status(404).send('This username does not exist.');
                }
            }
        );
    }
)

app.post("/accountDeletionRequest", verifyJWTMiddleware, async (req, res)=>{
    const {password}= req.body;
    db.query(
        'SELECT * FROM users WHERE username = ?',
        [req.decodedToken.username],
        async (err, results) => {
            if(err){
                console.log(err);
                res.status(500).send("Error logging in.")
            }
            else if (results.length>0){
                const match = await bcrypt.compare(password, results[0].password);
                if (match) {
                    res.clearCookie('theJWTToken');
                    queryTheDatabase("DELETE FROM users WHERE username = ?", [req.decodedToken.username], res);
                } 
                else {
                    res.status(401).send('Your password is incorrect.');

                }
            }
            else {
                res.status(404).send('This username does not exist.');
            }
        }
    );
})

app.post("/login", async (req, res)=>{ // secure
    const { username, password } = req.body;
    console.log(username)
    console.log(password)
    db.query(
        'SELECT * FROM users WHERE username = ?',
        [username],
        async (err, results) => {
            if(err){
                console.log(err);
                res.status(500).send("Error logging in.")
            }
            else if (results.length>0){
                console.log(results)
                const match = await bcrypt.compare(password, results[0].password);
                if (match) {
                    const exp = Math.floor(Date.now() / 1000) + 86400;
                    const token = jwt.sign({ username, exp, UserId: results[0].id}, secretKey);

                    res.cookie('theJWTToken', token, {
                        expires: new Date(Date.now() + 86400000),
                        httpOnly: true,
                        creationDate: Date.now()
                        //secure: true,                  Will change on deployment
                        //Some same site attribute
                    });
                    return res.status(200).json("Successfully logged in!"); // Will have to change this later
                } 
                else {
                    res.status(401).send('Your password is incorrect.');

                }
            }
            else {
                res.status(404).send('This username does not exist.');
            }
        }
    );
})

app.get('/verify-token', verifyJWTMiddleware, (req, res)=>{ //secure
    console.log(req.decodedToken)
    return res.json(req.decodedToken);
})

app.post('/logout', verifyJWTMiddleware, (req,res)=>{
    const token=req.cookies.theJWTToken;
    db.query('INSERT INTO blacklisted_tokens (token) VALUES (?)', [token], function(err){
        if(err){
            console.log(err);
            res.status(500).send('Error blacklisting token');
        }
        else {
            res.clearCookie('theJWTToken');
            res.status(201).send("Successfully blacklisted token")
        }
    })
})

app.get('/users', verifyJWTMiddleware, (req,res)=>{
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

app.post('/video/:VideoId', verifyJWTMiddleware, async (req,res)=>{ //secure 
    const VideoLinkId= req.params.VideoId;
    const {UserId, Title} = req.body
    if(req.decodedToken.UserId !== UserId){
        return res.status(403).send("You do not have permission to do that");
    }
    const isItAlreadyThere = await queryTheDatabaseGiveResults("SELECT * FROM VideoPost WHERE VideoLinkId = ?", [VideoLinkId]);
    if(isItAlreadyThere.length!==0){
        return res.status(400).send("Video already exists");
    }
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

app.post('/video-rating/:VideoPostId', verifyJWTMiddleware, (req,res)=>{ //secure
    const VideoPostId= req.params.VideoPostId;
    const {UserId, LikeStatus}= req.body;
    if(req.decodedToken.UserId !== UserId){
        return res.status(403).send("You do not have permission to do that");
    }
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

app.post('/genre', verifyJWTMiddleware, (req,res)=>{
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

app.get('/users/id', verifyJWTMiddleware, (req, res)=> {
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
}
)


app.get('/genre/id', verifyJWTMiddleware, (req, res)=> {
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

app.get('/video/id', verifyJWTMiddleware, (req, res)=>{
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
app.delete('/video', verifyJWTMiddleware, async (req, res)=>{
    const {id, VideoPostId, LikeDislikeId, GenreId, VideoPostGenreId, UserId, VideoPostCommentId}= req.query
    console.log(typeof(UserId))
    console.log("USER ID: " + UserId)
    if(id){
        if(req.decodedToken.UserId !== parseInt(id)){
            return res.status(403).send("You do not have permission to do that");
        }
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
        const authorizedUserId = (await whoOwnsThis("VideoPostId", VideoPostId))[0].UserId;
        if(req.decodedToken.UserId !== authorizedUserId){
            return res.status(403).send("You do not have permission to do that");
        }
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
        const authorizedUserId = (await whoOwnsThis("LikeDislikeId", LikeDislikeId))[0].UserId;
        if(req.decodedToken.UserId !== authorizedUserId){
            return res.status(403).send("You do not have permission to do that");
        }
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
    else if(VideoPostCommentId && UserId){
        if(req.decodedToken.UserId !== parseInt(UserId)){
            return res.status(403).send("You do not have permission to do that");
        }
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
        const authorizedUserId = (await whoOwnsThis("VideoPostCommentId", VideoPostCommentId))[0].UserId;
        if(req.decodedToken.UserId !== authorizedUserId){
            return res.status(403).send("You do not have permission to do that");
        }
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
})
app.get('/video', verifyJWTMiddleware,(req,res)=>{
    db.query('SELECT * FROM VideoPost', (err, results)=>{
        if(err) {
            console.log(err)
            res.status(500).send("Internal Server Error");
        }
        return res.json(results);
    });
})

app.get('/video-by-genre-or-user', verifyJWTMiddleware, (req,res)=>{
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

app.get('/video-rating', verifyJWTMiddleware, async (req,res)=>{   
    const {VideoPostId, UserId}= req.query
    if(VideoPostId && UserId){
        if(req.decodedToken.UserId !== parseInt(UserId)){
            return res.status(403).send("You do not have permission to do that");
        }
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

app.get("/forumPostByUsername", verifyJWTMiddleware, (req, res) =>{
    const username = req.query.username
    console.log("HI USER " + username)
    db.query("SELECT * from forumpost WHERE username=?", [username], (err, data) =>{
        if(err){
            console.log(err)
        }
        return res.json(data)
    })
})

app.get("/UserPosts", verifyJWTMiddleware, (req,res)=>{
    const username = req.decodedToken.username
    db.query('SELECT * FROM forumpost WHERE username = ?', [username], (err, data)=>{
        const query = `
        SELECT ForumPost.id, ForumPost.username, ForumPost.title, ForumPost.body, ForumPost.post_timestamp, GROUP_CONCAT(ForumTag.ForumTagName) AS tags
        FROM ForumPost
        LEFT JOIN ForumPostTag ON ForumPost.id = ForumPostTag.ForumPostID
        LEFT JOIN ForumTag ON ForumPostTag.ForumTagID = ForumTag.ForumTagID
        WHERE ForumPost.username=?
        GROUP BY ForumPost.id
        ORDER BY ForumPost.post_timestamp DESC;`;
        db.query(query, [username], (err, data)=>{
            if(err){
                res.send(err)
            }
            return res.json(data)
        })
    })
})

/*
- add new post
- recalculate tfidf vector for previous posts
- 
*/
app.post("/forumPostCreate", verifyJWTMiddleware, async (req, res) => {
    const allPosts = req.body.allPosts
    const username = req.body.username
    const title = req.body.title
    const body = req.body.body

    const tfidfVector = {}

    if(req.decodedToken.username !== username){
        return res.status(403).send("Incorrect User")
    }

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
    db.query('INSERT INTO ForumPost(username, title, body, post_timestamp, tfidf_vector) VALUES (?, ?, ?, NOW(), ?)', [username, title, body, tfidfVectorString], function(err, insertResult) {
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
            })
        }
    })
})

app.post("/forumTagCreate", verifyJWTMiddleware, async (req,res)=>{
    const forumTagName = req.query.forumTagName.trim().toLowerCase();
    //inserts tag into db, if already exists do nothing
    const query = "INSERT IGNORE INTO ForumTag (forumTagName) VALUES (?)";
    try {
        const data = await new Promise((resolve, reject) => {
            db.query(query, [forumTagName], (err, data)=>{
                if(err){
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
        res.status(200).json({ data: data });
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
});

app.get("/fetchForumTag", verifyJWTMiddleware, (req,res)=>{
    const forumTagName = req.query.forumTagName.trim().toLowerCase();
    const query = "SELECT ForumTagID FROM ForumTag WHERE ForumTagName = ?"
    db.query(query, [forumTagName], (err, data)=>{
        if(err){
            res.send(err)
        } else{
            return res.json(data)
        }
    })
})

app.post("/forumPostTagCreate", verifyJWTMiddleware, async (req,res)=>{
    const postID = req.query.postID
    const forumTagID = req.query.forumTagID
    const authorizedUsername = (await whoOwnsThis("ForumPostId", postID))[0].username;
    if(req.decodedToken.username !== authorizedUsername){
        return res.status(403).send("You do not have permission to do that");
    }
    
    const query = "INSERT INTO ForumPostTag (ForumPostID, ForumTagID) VALUES (?, ?)";
    try {
        const data = await new Promise((resolve, reject) => {
            db.query(query, [postID, forumTagID], (err, data) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(data)
                }
            })
        })
        res.status(200).json({ data: data });
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
})

app.get("/fetchForumPostTagID", verifyJWTMiddleware, async (req, res)=>{   //change to get later
    const postID = req.query.postID
    const query = "SELECT ForumTagID FROM ForumPostTag WHERE ForumPostID = ?"
    db.query(query, [postID], (err, data)=>{
        if(err){
            res.send(err)
        } else{
            return res.json(data)
        }
    })
})

app.get("/fetchForumSubscriptions", verifyJWTMiddleware, (req, res)=>{
    const userID = req.decodedToken.UserId
    const query = `SELECT ForumTag.ForumTagName 
    FROM ForumSubscriptions 
    LEFT JOIN ForumTag ON ForumSubscriptions.ForumTagID = ForumTag.ForumTagID
    WHERE UserID = ?`
    db.query(query, [userID], (err, data)=>{
        if(err){
            res.send(err)
        } else{
            return res.json(data)
        }
    })
})

app.get("/fetchForumSubscriptionOnly", verifyJWTMiddleware, (req, res)=>{
    const userID = req.decodedToken.UserId
    const query = "SELECT Only FROM ForumSubscriptionOnly WHERE UserID = ?"
    db.query(query, [userID], (err, data)=>{
        if(err){
            res.send(err)
        } else{
            return res.json(data)
        }
    })
})

app.post("/createForumSubscriptionOnly", verifyJWTMiddleware, (req, res)=>{
    const userID = req.decodedToken.UserId
    const only = req.query.Only
    const query = "INSERT INTO ForumSubscriptionOnly (UserID, Only) VALUES (?, ?)"
    db.query(query, [userID, only], (err, data)=>{
        if(err){
            console.log(err)
            res.status(500).send(err);
        } else{
            return res.status(204).send("ForumSubscriptionOnly created successfully")
        }
    })
})

app.post("/createForumSubscription", verifyJWTMiddleware, (req, res)=>{
    const userID = req.decodedToken.UserId
    const ForumTagID = req.query.ForumTagID
    const query = "INSERT INTO ForumSubscriptions (UserID, ForumTagID) VALUES (?, ?)"
    db.query(query, [userID, ForumTagID], (err, data)=>{
        if(err){
            res.status(500).send(err);
            console.log(err)
        } else{
            return res.status(201).send("ForumSubscriptions created successfully")
        }
    })
})

app.delete("/deleteForumSubscriptionOnly", verifyJWTMiddleware, (req, res)=>{
    const userID = req.decodedToken.UserId
    const query = "DELETE FROM ForumSubscriptionOnly WHERE UserID = ?"
    db.query(query, [userID], (err, data)=>{
        if(err){
            res.status(500).send(err);

        } else{
            return res.status(201).send("ForumSubscriptionOnly deleted successfully")
        }
    })
})

app.delete("/deleteForumSubscription", verifyJWTMiddleware, (req, res)=>{
    const userID = req.decodedToken.UserId
    const query = "DELETE FROM ForumSubscriptions WHERE UserID = ?"
    db.query(query, [userID], (err, data)=>{
        if(err){
            res.status(500).send(err)
            console.log(err)
        } else{
            return res.status(204).send("ForumSubscriptions deleted successfully")
        }
    })
})

//viewing all posts, mainly for testing purposes can change the condition later
app.get("/forumPostsAll", verifyJWTMiddleware, (req,res)=>{
    const userID = req.decodedToken.UserId
    let query = `
    SELECT ForumPost.id, ForumPost.username, ForumPost.title, ForumPost.body, ForumPost.post_timestamp, GROUP_CONCAT(ForumTag.ForumTagName) AS tags
    FROM ForumPost
    ${ /* Combine all tables */'' }
    LEFT JOIN ForumPostTag ON ForumPost.id = ForumPostTag.ForumPostID
    LEFT JOIN ForumTag ON ForumPostTag.ForumTagID = ForumTag.ForumTagID
    GROUP BY ForumPost.id
    ORDER BY ForumPost.post_timestamp DESC;`
    db.query(query, (err, data)=>{
        if(err){
            console.log(err)
            res.status(500).send(err);
        }
        return res.json(data)
    })
})

//viewing a post by its id
app.get("/forumPostsById/:postID", verifyJWTMiddleware, async (req,res)=>{
    const id = parseInt(req.params.postID, 10)
    const query = `
    SELECT ForumPost.id, ForumPost.username, ForumPost.title, ForumPost.body, ForumPost.post_timestamp, GROUP_CONCAT(ForumTag.ForumTagName) AS tags
    FROM ForumPost
    LEFT JOIN ForumPostTag ON ForumPost.id = ForumPostTag.ForumPostID
    LEFT JOIN ForumTag ON ForumPostTag.ForumTagID = ForumTag.ForumTagID
    WHERE ForumPost.id=?
    GROUP BY ForumPost.id
    ORDER BY ForumPost.post_timestamp DESC;
`;
    db.query(query, [id], (err, data)=>{
        if(err){
            res.send(err)
        }
        return res.json(data)
    })
})

app.delete("/forumPostDelete/:id", verifyJWTMiddleware, async (req,res)=>{
    const forumPostID = req.params.id

    const postUsername = (await whoOwnsThis("ForumPostId", forumPostID))[0].username;
    if(req.decodedToken.username !== postUsername){
        return res.status(403).send("Incorrect User")
    }
    
    const query = "DELETE FROM forumpost WHERE id = ?"
    db.query(query, [forumPostID], (err,data)=>{
        if (err) return res.send(err)
        return res.json("Post has been deleted successfully");
    });
});

app.put("/editForumPost/:id", verifyJWTMiddleware, async (req, res) =>{
    const forumPostID = req.params.id
    const allPosts = req.body.allPosts
    const tfidfVector = {}

    const postUsername = (await whoOwnsThis("ForumPostId", forumPostID))[0].username;
    if(req.decodedToken.username !== postUsername){
        return res.status(403).send("Incorrect User")
    }

    //add all previous posts to the corpus
    allPosts.forEach(post => {
        var tokenedPreviousPost = tokenizer.tokenize(post.body)
        tokenedPreviousPost = stopwords.removeStopwords(tokenedPreviousPost, enStopwords)
        tfidf.addDocument(tokenedPreviousPost)
        tfidf.documents[tfidf.documents.length - 1].__key = post.id //key for idenfying which post is from
    });

     //add current post to the corpus
     var tokenedCurrentPost = tokenizer.tokenize(req.body.newBody)
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
        })
    }

    //calculate currnent post tfidf vector
    tfidf.listTerms(tfidf.documents.length - 1).forEach(function(item) {
        tfidfVector[item.term] = item.tfidf
    });
    //new tfidfVector from the edited post
    const tfidfVectorString = JSON.stringify(tfidfVector)

    const query = "UPDATE forumpost SET body=?, tfidf_vector=? WHERE id=?"
    db.query(query, [req.body.newBody, tfidfVectorString, forumPostID], (err, data)=>{
        if(err){
            console.log(err)
            return res.send(err)
        }
        else{
            return res.status(201).send("Edit Done")
        }
    })
})

//gets forum posts liked by a user
app.get("/forumPostsLikedByUser/", verifyJWTMiddleware, async (req,res)=>{
    const userID = req.decodedToken.UserId
    const forumPostID = req.query.postID
    const query = "SELECT * FROM ForumPostLikeDislike WHERE forumPostID = ? AND userID = ? AND LikeStatus = 1"
    db.query(query, [forumPostID, userID], (err,data)=>{
        if (err) return res.send(err)
        return res.json(data);
    });
});

//gets forum posts disliked by a user
app.get("/forumPostsDislikedByUser/", verifyJWTMiddleware, async (req,res)=>{
    const userID = req.decodedToken.UserId
    const forumPostID = req.query.postID
    const query = "SELECT * FROM ForumPostLikeDislike WHERE forumPostID = ? AND userID = ? AND LikeStatus = 0"
    db.query(query, [forumPostID, userID], (err,data)=>{
        if (err) return res.send(err)
        return res.json(data);
    });
});

//gets likes from post
app.get("/fetchAllForumPostLikes/", verifyJWTMiddleware, (req,res)=>{
    //holds number of likes for each post
    const forumPostID = req.query.postID
    const queryLikes = "SELECT * FROM ForumPostLikeDislike WHERE forumPostID = ? AND LikeStatus = 1"
    db.query(queryLikes, [forumPostID], (err, data)=>{
        if (err){
            res.status(500).send("Error in fetching Likes");
        }
        else { 
            return res.json(data)
        }
    });
});

//gets dislikes from post
app.get("/fetchAllForumPostDislikes/", verifyJWTMiddleware, (req,res)=>{
    //holds number of dislikes for each post
    const forumPostID = req.query.postID
    const queryLikes = "SELECT * FROM ForumPostLikeDislike WHERE forumPostID = ? AND LikeStatus = 0"
    db.query(queryLikes, [forumPostID], (err, data)=>{
        if (err){
            res.status(500).send("Error in fetching Dislikes");
        }
        else { 
            return res.json(data)
        }
    })
})

//Gets posts that has a dislike/like in db by user
app.get("/forumPostLikeStatus/", verifyJWTMiddleware, (req,res)=>{
    const forumPostID = req.query.postID
    const userID = req.decodedToken.UserId
    const query = "SELECT * FROM ForumPostLikeDislike WHERE forumPostID = ? AND UserID = ?"
    db.query(query, [forumPostID, userID], (err,data)=>{
        if (err){
            return res.send("error");
        }
        else { 
            return res.json(data)
        }
    });
});

//Posts a like/dislike with user and post
app.post("/forumPostLikeDislike/", verifyJWTMiddleware, (req,res)=>{
    const forumPostID = req.query.postID
    const userID = req.decodedToken.UserId
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
app.put("/forumPostChangeLikeDislike/", verifyJWTMiddleware, async (req,res)=>{
    const LikeDislikeID = req.query.LikeDislikeID
    const rating = req.query.rating
    const authorizedUserId = (await whoOwnsThis("ForumPostLikeDislikeID", LikeDislikeID))[0].UserID;
    if(req.decodedToken.UserId !== authorizedUserId){
        return res.status(403).send("You do not have permission to do that");
    }
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
app.delete("/forumPostDeleteLikeDislike/", verifyJWTMiddleware, async (req,res)=>{
    const LikeDislikeID = req.query.LikeDislikeID
    const authorizedUserId = (await whoOwnsThis("ForumPostLikeDislikeID", LikeDislikeID))[0].UserID;
    if(req.decodedToken.UserId !== authorizedUserId){
        return res.status(403).send("You do not have permission to do that");
    }
    const query = "DELETE FROM ForumPostLikeDislike WHERE LikeDislikeID = ?"
    db.query(query, [LikeDislikeID], (err, data) => {
        if (err) {
            return res.status(500).send("Internal Server Error")
        } else {
            return res.status(201).send("Like/Dislike Delete Successful!")
        }
    });
});

app.post("/forumPostComment/:id", verifyJWTMiddleware, (req, res) => {
    const forumPostID = parseInt(req.params.id, 10)
    //debugging purposes
    const username = req.body.username
    const body = req.body.body

    if(req.decodedToken.username !== username){
        return res.status(403).send("Incorrect User")
    }

   db.query("INSERT INTO forumpostcomments(forum_post_id, username, body, comment_timestamp) VALUES (?, ?, ?, NOW())", [forumPostID, username, body], function (err, results){
    if(err){
        console.log(err)
    }else{
        db.query("SELECT * FROM ForumPost WHERE id = ?", [forumPostID], (err1,results1)=>{
            if(err1){
                console.log(err1);
                return res.status(500).send("Internal Server Error");
            }
            db.query("SELECT * FROM users WHERE username = ?", [results1[0].username], (err2, results2)=>{
                if(err2){
                    console.log(err2);
                    return res.status(500).send("Internal Server Error");
                }
                db.query("SELECT * FROM users WHERE username = ?", [username], (err3, results3)=>{
                    if(err3){
                        console.log(err3);
                        return res.status(500).send("Internal Server Error");
                    }
                    if(results2[0].id !== results3[0].id) {
                        io.to(`UserId_${results2[0].id}`).emit("newNotification", {
                            ForumPostReceiverUserId: results2[0].id,
                            ForumCommentSenderUserId: results3[0].id, 
                            ForumPostId: forumPostID,
                            SenderForumPostCommentId : results.insertId,
                            Message: body,
                            CommentedAt: new Date().toISOString(),
                            NotificationRead:0
                        })
                    }
                    return res.status(201).send({id: results.insertId});
                })
            })
        } );
    }
    })
})

app.get("/getForumPostCommentByID/:id", verifyJWTMiddleware, (req, res) =>{
    const forumPostCommentID = parseInt(req.params.id, 10)
    db.query("SELECT * FROM FORUMPOSTCOMMENTS WHERE id=?", [forumPostCommentID], function(err, data){
        if(err){
            return res.status(403).send("Error Occured")
        }
        else{
            return res.json(data)
        }
    })
})


app.put("/deleteForumPostComment/:commentID",verifyJWTMiddleware, async (req, res) =>{
    const commentID = parseInt(req.params.commentID, 10)
    const commentUser = (await whoOwnsThis("ForumPostCommentId", commentID))[0].username;
    if(req.decodedToken.username !== commentUser){
        return res.status(403).send("Incorrect User")
    }
    db.query("UPDATE FORUMPOSTCOMMENTS SET DELETED=? WHERE id=?", [true, commentID], function(err){
        if(err){
            console.log(err)
        }
        else{
            return res.status(201).send("Comment Deleted")
        }
    })
})

app.put("/editForumPostComment/:commentID", verifyJWTMiddleware, async (req, res) =>{
    const commentID = parseInt(req.params.commentID, 10)
    const editedBody = req.body.editedBody
    const commentUser = (await whoOwnsThis("ForumPostCommentId", commentID))[0].username;
    if(req.decodedToken.username !== commentUser){
        return res.status(403).send("Incorrect User")
    }

    db.query("UPDATE FORUMPOSTCOMMENTS SET body=? WHERE id=?", [editedBody, commentID], function(err){
        if(err){
            console.log(err)
        }
        else{
            return res.status(201).send("Comment Edited")
        }
    })
})

app.get("/getForumPostComments", verifyJWTMiddleware, async(req, res) =>{
    const username = req.query.username
    db.query("SELECT * FROM ForumPostComments WHERE username=?", [username], function(err, data){
        if(err){
            console.log(err)
        }else{
            return res.json(data)
        }
    })
})

app.get("/getVideoPostComments", async(req, res) =>{
    const userID = req.query.userID
    db.query("SELECT * FROM VideoPostComments WHERE UserId=?", [userID], function(err, data){
        if(err){
            console.log(err)
        }else{
            return res.json(data)
        }
    })
})

//gets likes from comment
app.get("/fetchAllForumPostCommentLikes/", verifyJWTMiddleware, (req,res)=>{
    //holds number of likes for each post
    const forumPostCommentID = req.query.commentID
    const queryLikes = "SELECT * FROM ForumCommentLikeDislike WHERE forumPostCommentID = ? AND LikeStatus = 1"
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
app.get("/fetchAllForumPostCommentDislikes/", verifyJWTMiddleware, async(req,res)=>{
    //holds number of dislikes for each post
    const forumPostCommentID = req.query.commentID
    const queryDislikes = "SELECT * FROM ForumCommentLikeDislike WHERE forumPostCommentID = ? AND LikeStatus = 0"
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
app.get("/forumPostCommentLikeStatus/", verifyJWTMiddleware, (req,res)=>{
    const forumPostCommentID = req.query.commentID
    const userID = req.decodedToken.UserId
    const query = "SELECT * FROM ForumCommentLikeDislike WHERE forumPostCommentID = ? AND UserID = ?"
    db.query(query, [forumPostCommentID, userID], (err,data)=>{
        if (err){
            return res.send("error");
        }
        else { 
            return res.json(data)
        }
    })
})

//Posts a like/dislike with user and comment
app.post("/forumPostCommentLikeDislike/", verifyJWTMiddleware, (req,res)=>{
    const forumPostCommentID = req.query.commentID
    const userID = req.decodedToken.UserId
    const rating = req.query.rating
    const query = "INSERT INTO ForumCommentLikeDislike (forumPostCommentID, UserID, LikeStatus) VALUES (?, ?, ?)"
    db.query(query, [forumPostCommentID, userID, rating], (err, data) => {
        if (err) {
            return res.status(500).send("Internal Server Error")
        } else {
            return res.status(201).send("Like/Dislike Successful!")
        }
    });
});

//Changes like to dislike and vice versa with user and comment
app.put("/forumPostCommentChangeLikeDislike/", verifyJWTMiddleware, async (req,res)=>{
    const LikeDislikeID = req.query.LikeDislikeID
    const rating = req.query.rating
    const authorizedUserID = (await whoOwnsThis("ForumPostCommentLikeDislikeId", LikeDislikeID))[0].UserID
    if(req.decodedToken.UserId !== authorizedUserID){
        return res.status(403).send("You do not have permission to do that");
    }
    const query = "UPDATE ForumCommentLikeDislike SET LikeStatus = ? WHERE LikeDislikeID = ?"
    db.query(query, [rating, LikeDislikeID], (err, data) => {
        if (err) {
            return res.status(500).send("Internal Server Error")
        } else {
            return res.status(201).send("Like/Dislike Update Successful!")
        }
    });
});

//Deletes like/dislike from database
app.delete("/forumPostCommentDeleteLikeDislike/", verifyJWTMiddleware, async (req,res)=>{
    const LikeDislikeID = req.query.LikeDislikeID
    const authorizedUserID = (await whoOwnsThis("ForumPostCommentLikeDislikeId", LikeDislikeID))[0].UserID
    if(req.decodedToken.UserId !== authorizedUserID){
        return res.status(403).send("You do not have permission to do that");
    }
    const query = "DELETE FROM ForumCommentLikeDislike WHERE LikeDislikeID = ?"
    db.query(query, [LikeDislikeID], (err, data) => {
        if (err) {
            return res.status(500).send("Internal Server Error")
        } else {
            return res.status(201).send("Like/Dislike Update Successful!")
        }
    });
});

//gets forum comments liked by a user
app.get("/forumPostCommentsLikedByUser/", verifyJWTMiddleware, (req,res)=>{
    const userID = req.decodedToken.UserId
    const forumPostCommentID = req.query.commentID
    const query = "SELECT * FROM ForumCommentLikeDislike WHERE forumPostCommentID = ? AND userID = ? AND LikeStatus = 1"
    db.query(query, [forumPostCommentID, userID], (err,data)=>{
        if (err) return res.send(err)
        return res.json(data);
    });
});

//gets forum comments disliked by a user
app.get("/forumPostCommentsDislikedByUser/", verifyJWTMiddleware, (req,res)=>{
    const userID = req.decodedToken.UserId
    const forumPostCommentID = req.query.commentID
    const query = "SELECT * FROM ForumCommentLikeDislike WHERE forumPostCommentID = ? AND userID = ? AND LikeStatus = 0"
    db.query(query, [forumPostCommentID, userID], (err,data)=>{
        if (err) return res.send(err)
        return res.json(data);
    });
});

app.get("/forumPostParentCommentGetByID/:id", verifyJWTMiddleware, (req, res) =>{
    const forumPostID = parseInt(req.params.id, 10)
    db.query("SELECT * FROM forumpostcomments WHERE forum_post_id=? AND parent_comment_id IS NULL", [forumPostID], function (err, data){
    if(err){
        console.log(err)
    }
    return res.json(data)
    })
})

app.post("/forumPostCommentReply/:id/:commentID", verifyJWTMiddleware, (req, res) => {
    const forumPostID = parseInt(req.params.id, 10)
    const commentID = parseInt(req.params.commentID, 10)
    const username = req.body.username
    const body = req.body.body
    const timestamp = new Date().toISOString()

    if(req.decodedToken.username !== username){
        return res.status(403).send("Incorrect User")
    }
    const reply = {
        username,
        body,
        timestamp
    }
    const insertQuery = "INSERT INTO forumpostcomments(forum_post_id, username, body, comment_timestamp, parent_comment_id) VALUES (?, ?, ?, NOW(),?)"

    db.query(insertQuery, [forumPostID, username, body, commentID], (err, insertResult) => {
        if (err) {
            console.log(err)
        } else {
            const replyID = insertResult.insertId
            const selectQuery = "SELECT * from forumpostcomments where id=?"
            db.query(selectQuery, [replyID], (err1, selectResult) => {
                if (err1) {
                    console.log(err1)
                } else {
                    const replyID = insertResult.insertId
                    const selectQuery = "SELECT username from forumpostcomments where id=?"
                    db.query(selectQuery, [replyID], (err, selectResult) => {
                        if (err) {
                            console.log(err)
                        } else {
                            const replyUsername = selectResult[0].username;
                            db.query("SELECT * FROM ForumPostComments WHERE id = ?", [commentID], (err2, results2) => {
                                if (err2) {
                                    console.log(err2);
                                }
                                db.query("SELECT * FROM users WHERE username = ?", [results2[0].username], (err3, results3) => {
                                    if (err3) {
                                        console.log(err3);
                                        res.status(500).send("internal server error");
                                    }
                                    db.query("SELECT * FROM users WHERE username = ?", [username], (err4, results4) => {
                                        if (err4) {
                                            console.log(err4);
                                            res.status(500).send("internal server error");
                                        }
                                        if (results4[0].id !== results3[0].id) {
                                            io.to(`UserId_${results3[0].id}`).emit("newNotification", {
                                                ForumCommentSenderUserId: results4[0].id,
                                                ForumCommentReceiverUserId: results3[0].id,
                                                Message: body,
                                                CommentedAt: new Date().toISOString(),
                                                ForumPostId: forumPostID,
                                                NotificationRead: 0,
                                                SenderForumPostCommentId: insertResult.insertId,
                                                ReceiverForumPostCommentId: commentID
                                            })
                                        }
                                        res.status(201).send({
                                            id: replyID,
                                            username: replyUsername,
                                            message: "Reply Successful"
                                        })
                                    })

                                })


                            })

                        }
                    })
                }
            })
        }
    })
})

app.get("/forumPostParentGetReplies/:id/:commentID", verifyJWTMiddleware, (req, res) =>{
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

app.get("/forumPostSearch/:searchTitle", verifyJWTMiddleware, (req, res) => {
    const searchTitle = req.params.searchTitle
    db.query("SELECT * FROM forumpost WHERE title LIKE ? OR title LIKE ?",['% ' + searchTitle + ' %', '%' + searchTitle +'%'], function (err, data){
        if(err){
            console.log(err)
        }
        else{
            return res.json(data)
        }
    })
})

app.get("/videoPostSearch/:searchTitle", verifyJWTMiddleware, (req, res) => {
    const searchTitle = req.params.searchTitle
    db.query("SELECT * FROM videopost WHERE Title LIKE ? OR Title LIKE ?",['% ' + searchTitle + ' %', '%' + searchTitle +'%'], function (err, data){
        if(err){
            console.log(err)
        }
        else{
            return res.json(data)
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


/*
to see if a post should be recommended, take the consine similarity of the tfidf_vector
if it meets the threshold, recommend it
*/
app.get("/forumPostRecommendedPost/:postID", verifyJWTMiddleware, (req, res) =>{
    const postID = req.params.postID
    const recommendedPosts = []
    db.query("SELECT * from forumpost WHERE ID=?", [postID], function(err, data){
        if(err){
            console.log(err)
        }
        else{
            const post = data[0]
            db.query("SELECT * from forumpost WHERE ID!=?", [postID], function(err, data){
                if(err){
                    console.log(err)
                }
                else{
                    const similarityThreshold = 0.10
                    data.forEach(otherPost =>{
                        if(cosineSimilarity(post.tfidf_vector, otherPost.tfidf_vector) >= similarityThreshold){
                            recommendedPosts.push(otherPost)
                        }
                    })
                    return res.status(201).send({recommendedPosts: recommendedPosts})
                }
            })
            
        }
})
})

app.get("/fetchAllPlaylistVideosID", verifyJWTMiddleware, async (req, res)=>{
    const playlistID = req.query.playlistID
    const authorizedUserID = (await whoOwnsThis("PlaylistID", playlistID))[0].UserID
    if(req.decodedToken.UserId !== authorizedUserID){
        return res.status(403).send("You do not have permission to do that");
    }
    const query = "SELECT VideoPostID FROM playlistvideoposts WHERE PlaylistID = ?"
    db.query(query, [playlistID], (err, data)=>{
        if(err){
            console.log(err)
            return res.status(500).send("Error fetching videoIDs")
        } else{
            return res.json(data)
        }
    })
})

app.get("/fetchAllVideos", verifyJWTMiddleware, (req, res)=>{
    const videoPostID = req.query.videoPostID
    const query = "SELECT * FROM VideoPost JOIN users ON VideoPost.UserId = users.id WHERE VideoPostId = ?";
    db.query(query, [videoPostID], (err, data)=>{
        if(err){
            console.log(err)
            res.status(500).send("Error fetching videos")
        } else{
            return res.json(data)
        }
    })
})

app.get("/fetchVideoInPlaylist", verifyJWTMiddleware, async (req, res)=>{
    const playlistID = req.query.playlistID
    const videoPostID = req.query.videoPostID
    const authorizedUserID = (await whoOwnsThis("PlaylistID", playlistID))[0].UserID
    if(req.decodedToken.UserId !== authorizedUserID){
        return res.status(403).send("You do not have permission to do that");
    }
    const query = "SELECT * FROM playlistvideoposts WHERE PlaylistID = ? AND VideoPostID = ?"
    db.query(query, [playlistID, videoPostID], (err, data)=>{
        if(err){
            console.log(err)
            res.status(500).send("Error fetching videos")
        } else{
            return res.json(data)
        }
    })
})

app.post("/addVideoToPlaylist", verifyJWTMiddleware, async (req, res)=>{
    const playlistID = req.query.playlistID
    const videoPostID = req.query.videoPostID
    const authorizedUserID = (await whoOwnsThis("PlaylistID", playlistID))[0].UserID
    if(req.decodedToken.UserId !== authorizedUserID){
        return res.status(403).send("You do not have permission to do that");
    }
    const query = "INSERT INTO playlistvideoposts (DateAdded, PlaylistID, VideoPostID) VALUES (NOW(), ?, ?)"
    db.query(query, [playlistID, videoPostID], (err, data)=>{
        if (err) {
            return res.status(500).send("Internal Server Error")
        } else {
            return res.status(201).send("Video Added to Playlist!")
        }
    })
})

app.delete("/deleteVideoFromPlaylist", verifyJWTMiddleware, async (req, res)=>{
    const playlistID = req.query.playlistID
    const videoPostID = req.query.videoPostID
    const authorizedUserID = (await whoOwnsThis("PlaylistID", playlistID))[0].UserID
    if(req.decodedToken.UserId !== authorizedUserID){
        return res.status(403).send("You do not have permission to do that");
    }

    const query = "DELETE FROM playlistvideoposts WHERE PlaylistID = ? AND VideoPostID = ?"
    db.query(query, [playlistID, videoPostID], (err)=>{
        if (err) {
            return res.status(500).send(err)
        } else {
            return res.status(201).send("Video Deleted from Playlist!")
        }
    })
})

app.get("/fetchAllUserPlaylists", verifyJWTMiddleware, (req, res)=>{
    const userID = req.decodedToken.UserId

    const query = "SELECT * FROM Playlist WHERE userID = ?"
    db.query(query, [userID], (err, data)=>{
        if(err){
            console.log(err)
            res.status(500).send("Error fetching playlists")
        } else{
            return res.json(data)
        }
    })
})

app.post("/createPlaylist", verifyJWTMiddleware, (req, res)=>{
    const playlistName = req.query.playlistName
    const userID = req.decodedToken.UserId
    const query = "INSERT INTO Playlist (playlistName, dateCreated, userID) VALUES (?, NOW(), ?)"
    db.query(query, [playlistName, userID], (err, data)=>{
        if(err){
            console.log(err)
        } else{
            return res.json(data)
        }
    })
})

app.delete("/deletePlaylist", verifyJWTMiddleware, async (req, res)=>{
    const playlistID = req.query.playlistID
    const authorizedUserID = (await whoOwnsThis("PlaylistID", playlistID))[0].UserID
    if(req.decodedToken.UserId !== authorizedUserID){
        return res.status(403).send("You do not have permission to do that");
    }
    const query = "DELETE FROM Playlist WHERE PlaylistID = ?"
    db.query(query, [playlistID], (err)=>{
        if (err) {
            return res.status(500).send(err)
        } else {
            return res.status(201).send("Playlist Deleted!")
        }
    })
})

app.put("/editPlaylistName", verifyJWTMiddleware, async (req, res)=>{
    const playlistID = req.query.playlistID
    const newPlaylistName = req.query.newPlaylistName
    const authorizedUserID = (await whoOwnsThis("PlaylistID", playlistID))[0].UserID
    if(req.decodedToken.UserId !== authorizedUserID){
        return res.status(403).send("You do not have permission to do that");
    }
    const query = "UPDATE Playlist SET PlaylistName = ? WHERE PlaylistID = ?"
    db.query(query, [newPlaylistName, playlistID], (err)=>{
        if (err) {
            return res.status(500).send(err)
        } else {
            return res.status(201).send("Playlist Name Edited!")
        }
    })
})


app.get("/videoComments/:VideoPostId", verifyJWTMiddleware, (req,res)=>{
    const VideoPostId= req.params.VideoPostId;
    db.query('SELECT * FROM VideoPostComments WHERE VideoPostId = ?',[VideoPostId], (err, results)=>{
        if(err) {
            console.log(err)
            return res.status(500).send("Internal Server Error");
        }
        return res.json(results);
    });
})

app.put("/videoComments/:VideoPostCommentId", verifyJWTMiddleware, async (req,res)=>{
    const VideoPostCommentId = req.params.VideoPostCommentId;
    const {updatedComment}= req.body;
    const authorizedUserId = (await whoOwnsThis("VideoPostCommentId", VideoPostCommentId))[0].UserId;
    if(req.decodedToken.UserId !== authorizedUserId){
        return res.status(403).send("You do not have permission to do that");
    }
    db.query('UPDATE VideoPostComments SET Comment= ? WHERE VideoPostCommentId =?', [updatedComment, VideoPostCommentId], (err, results)=>{
        if(err) {
            console.log(err)
            return res.status(500).send("Internal Server Error");
        }
        return res.json(results);
    })
})

app.get("/video-comment-parent/:VideoPostCommentId", verifyJWTMiddleware, (req,res)=>{
    const VideoPostCommentId = req.params.VideoPostCommentId;
    queryTheDatabase("SELECT ReplyToVideoPostCommentId FROM VideoPostComments WHERE VideoPostCommentId = ?",[VideoPostCommentId], res );
})

app.get("/video-comment", verifyJWTMiddleware, (req,res)=>{
    const VideoPostCommentId = req.query.VideoPostCommentId;
    queryTheDatabase("SELECT * FROM VideoPostComments WHERE VideoPostCommentId = ?", [VideoPostCommentId], res)
})

app.get("/video-comment-descendants/:VideoPostCommentId", verifyJWTMiddleware, (req,res)=>{
    queryTheDatabase(`WITH RECURSIVE VideoCommentDescendants AS (
        SELECT * FROM VideoPostComments WHERE VideoPostCommentId = ?
        UNION
        SELECT VPC.* FROM VideoPostComments VPC INNER JOIN VideoCommentDescendants VCD ON VPC.ReplyToVideoPostCommentId = VCD.VideoPostCommentId
    ) SELECT * FROM VideoCommentDescendants`,[req.params.VideoPostCommentId],res);
})

app.post("/videoComments", verifyJWTMiddleware, async (req,res)=>{
    const {UserId, Comment, VideoPostId, ReplyToVideoPostCommentId}= req.body;
    if(req.decodedToken.UserId !== UserId){
        return res.status(403).send("You do not have permission to do that");
    }
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
            
                if(UserId!==results[0].UserId){
                    io.to(`UserId_${results[0].UserId}`).emit("newNotification", {
                        VideoCommentSenderUserId: UserId, 
                        VideoCommentReceiverUserId:results[0].UserId, 
                        Message:Comment, 
                        CommentedAt: new Date().toISOString(), 
                        VideoPostId: results.VideoPostId, 
                        DELETED:0, 
                        NotificationRead: 0, 
                        SenderVideoPostCommentId: results1.insertId, 
                        ReceiverVideoPostCommentId:ReplyToVideoPostCommentId
                    });
                }
                
                    res.json(results1);
            })
        })
    }
    else {
        db.query('INSERT INTO VideoPostComments (UserId, Comment, VideoPostId, ReplyToVideoPostCommentId, DELETED) VALUES (?, ?, ?, ?, ?)', [UserId, Comment, VideoPostId, ReplyToVideoPostCommentId, false], (err1, results1)=>{
            if(err1){
                console.log(err1)
                return res.status(500).send("Internal Server Error");
            }
            db.query("SELECT * FROM VideoPostComments WHERE VideoPostCommentId = ?", [results1.insertId], (err2,results2)=>{
                if(err2){
                    console.log(err2)
                        res.status(500).send("Internal Server Error");
                }
                db.query("SELECT * FROM VideoPost WHERE VideoPostId = ?", [results2[0].VideoPostId], (err3,results3)=>{
                    if(err3){
                        console.log(err3);
                            res.status(500).send("Internal Server Error");
                    }
                    if(results3[0].UserId!==results2[0].UserId){
                        io.to(`UserId_${results3[0].UserId}`).emit("newNotification", {
                            VideoPostReceiverUserId: results3[0].UserId, 
                            VideoCommentSenderUserId: results2[0].UserId, 
                            VideoPostId:results2[0].VideoPostId, 
                            SenderVideoPostCommentId:results2[0].VideoPostCommentId, 
                            Message: results2[0].Comment, 
                            CommentedAt:results2[0].CommentedAt, 
                            DELETED: results2[0].DELETED, 
                            NotificationRead:0 
                        });
                    }
                    res.json(results1);
                })
            })
        })
    }
})

app.post("/videoCommentRating", verifyJWTMiddleware, (req, res)=>{
    const {VideoPostCommentId, UserId, LikeStatus}= req.body;
    if(req.decodedToken.UserId !== UserId){
        return res.status(403).send("You do not have permission to do that");
    }
    db.query('INSERT INTO VideoPostCommentLikeDislike (VideoPostCommentId, UserId, LikeStatus) VALUES (?, ?, ?)', [VideoPostCommentId, UserId, LikeStatus], (err, results)=>{
        if(err){
            console.log(err);
            return res.status(500).send("Internal Server Error");
        }
        return res.status(201).send("Successfully added Video Comment Rating")
    })
})

app.get("/videoCommentRatings", verifyJWTMiddleware, async (req, res)=>{
    const {VideoPostCommentId, UserId} = req.query;
    if(UserId !== undefined){
        if(req.decodedToken.UserId!==parseInt(UserId)){
            return res.status(403).send("You do not have permission to do that");
        }
    }
    if(UserId !== undefined){
        db.query("SELECT * FROM VideoPostCommentLikeDislike WHERE UserId= ? AND VideoPostCommentId = ?", [UserId, VideoPostCommentId], (error, results)=>{
            if (error){
                console.log(error);
                return res.status(500).send("Internal Server Error");
            }
            return res.json(results);
        })        
    }
    else {
        db.query("SELECT * FROM VideoPostCommentLikeDislike WHERE VideoPostCommentId = ?", [VideoPostCommentId], (error, results)=>{
            if (error){
                console.log(error);
                return res.status(500).send("Internal Server Error");
            }
            return res.json(results);
        })  
    }
})

app.post("/friendRequests", verifyJWTMiddleware, (req, res)=>{
    const {SenderUserId, ReceiverUserId}= req.body;
    if(req.decodedToken.UserId !== SenderUserId){
        return res.status(403).send("You do not have permission to do that");
    }
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

app.delete("/friendRequests", verifyJWTMiddleware, (req,res)=>{
    const {SenderUserId, ReceiverUserId}= req.query;
    if(req.decodedToken.UserId !== parseInt(SenderUserId)){
        return res.status(403).send("You do not have permission to do that");
    }
    queryTheDatabase("DELETE FROM FriendRequests WHERE SenderUserId = ? AND ReceiverUserId = ?",[SenderUserId, ReceiverUserId], res)
})

app.post("/Friendships", verifyJWTMiddleware, async (req, res)=>{ //still incomplete
    const {UserId1, UserId2}= req.body;
    const combo1 = await queryTheDatabaseGiveResults("SELECT * FROM FriendRequests WHERE SenderUserId = ? AND ReceiverUserId = ?", [UserId1, UserId2]);
    const combo2 = await queryTheDatabaseGiveResults("SELECT * FROM FriendRequests WHERE SenderUserId = ? AND ReceiverUserId = ?", [UserId2, UserId1]);
    if(combo1.length===1){
        if(req.decodedToken.UserId !== UserId2){
            return res.status(403).send("You do not have permission to do that");
        }
        await queryTheDatabaseGiveResults("DELETE FROM FriendRequests WHERE SenderUserId = ? AND ReceiverUserId = ?", [UserId1, UserId2]);
    }
    else if (combo2.length===1){
        if(req.decodedToken.UserId !== UserId1){
            return res.status(403).send("You do not have permission to do that");
        }
        await queryTheDatabaseGiveResults("DELETE FROM FriendRequests WHERE SenderUserId = ? AND ReceiverUserId = ?", [UserId2, UserId1]);
    }
    else {
        return res.status(400)("No friend request exists between these two people.");
    }
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
app.delete("/Friendships", verifyJWTMiddleware,(req, res)=>{
    const {UserId1, UserId2}= req.query
    if(req.decodedToken.UserId !== parseInt(UserId1) && req.decodedToken.UserId !== parseInt(UserId2) ){
        return res.status(403).send("You do not have permission to do that");
    }
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

app.get("/OutgoingFriendRequests/:UserId", verifyJWTMiddleware, (req,res)=>{
    const UserId = req.params.UserId
    if(req.decodedToken.UserId !== parseInt(UserId)){
        return res.status(403).send("You do not have permission to do that");
    }
    queryTheDatabase("SELECT * FROM FriendRequests WHERE SenderUserId = ?", [UserId], res);
})
app.get("/IncomingFriendRequests/:UserId", verifyJWTMiddleware, (req,res)=>{
    const UserId = req.params.UserId
    if(req.decodedToken.UserId !== parseInt(UserId)){
        return res.status(403).send("You do not have permission to do that");
    }
    queryTheDatabase("SELECT * FROM FriendRequests WHERE ReceiverUserId = ?", [UserId], res);
})
app.get("/ListOfFriends/:UserId", verifyJWTMiddleware, (req, res)=>{
    const UserId = req.params.UserId
    if(req.decodedToken.UserId !== parseInt(UserId)){
        return res.status(403).send("You do not have permission to do that");
    }
    queryTheDatabase("SELECT * FROM Friendships WHERE UserId1 = ? OR UserId2 = ?", [UserId,UserId], res)
})

app.get("/FriendRelationship", verifyJWTMiddleware, (req,res)=>{
    const {LoggedInUserId, VisitorUserId}= req.query;
    if(req.decodedToken.UserId !== parseInt(LoggedInUserId)){
        return res.status(403).send("You do not have permission to do that");
    }
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

app.post('/video-genre', verifyJWTMiddleware, async (req,res)=>{
    const {VideoPostId, Genre}= req.body;
    const owner = await whoOwnsThis("VideoPostId", VideoPostId);

    const authorizedUserId = (await whoOwnsThis("VideoPostId", VideoPostId))[0].UserId;
    if(req.decodedToken.UserId !== authorizedUserId){
        return res.status(403).send("You do not have permission to this.");
    }
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

app.get("/genreName", verifyJWTMiddleware, (req, res)=>{ //fix this and add video later
    const {GenreId} = req.query;
    queryTheDatabase("SELECT * FROM Genre WHERE GenreId = ?", [GenreId], res);
})

app.get("/email", verifyJWTMiddleware, (req, res)=>{
    const {UserId} = req.query;
    if(req.decodedToken.UserId !== parseInt(UserId)){
        return res.status(403).send("You do not have permission to do that");
    }
    queryTheDatabase("SELECT email FROM users WHERE id = ?", [UserId], res)
})
app.put("/email", verifyJWTMiddleware, (req, res)=>{
    const {UserId, email} = req.body;
    if(req.decodedToken.UserId !== UserId){
        return res.status(403).send("You do not have permission to do that");
    }
    queryTheDatabase("UPDATE users SET email = ? WHERE id = ?", [email, UserId], res)
})

app.get("/videoSubscriptionOnly", verifyJWTMiddleware, (req, res)=>{
    const {UserId} = req.query;
    if(req.decodedToken.UserId !== parseInt(UserId)){
        return res.status(403).send("You do not have permission to do that");
    }
    queryTheDatabase("SELECT * FROM VideoSubscriptionOnly WHERE UserId = ?", [UserId], res)
});

app.delete("/videoSubscriptionOnly", verifyJWTMiddleware, (req,res)=>{
    const {UserId}= req.query;
    if(req.decodedToken.UserId !== parseInt(UserId)){
        return res.status(403).send("You do not have permission to do that");
    }
    queryTheDatabase("DELETE FROM VideoSubscriptionOnly WHERE UserId = ?", [UserId], res);
})
app.post("/videoSubscriptionOnly", verifyJWTMiddleware, (req, res)=>{
    const {UserId, Only}=req.body;
    if(req.decodedToken.UserId !== UserId){
        return res.status(403).send("You do not have permission to do that");
    }
    queryTheDatabase("INSERT INTO VideoSubscriptionOnly (UserId, Only) VALUES (?,?)", [UserId, Only], res);
})

app.get("/videoSubscriptions", verifyJWTMiddleware, (req, res)=>{
    const {UserId} = req.query;
    if(req.decodedToken.UserId !== parseInt(UserId)){
        return res.status(403).send("You do not have permission to do that");
    }
    queryTheDatabase("SELECT * FROM VideoSubscriptions WHERE UserId = ?", [UserId], res);
})

  app.delete("/videoSubscriptions", verifyJWTMiddleware, (req,res)=>{
    const {UserId} = req.query;
    if(req.decodedToken.UserId !== parseInt(UserId)){
        return res.status(403).send("You do not have permission to do that");
    }
    queryTheDatabase("DELETE FROM VideoSubscriptions WHERE UserId = ?", [UserId], res);
  })
  app.post("/videoSubscriptions", verifyJWTMiddleware, (req,res)=>{
    const {UserId, Genre}=req.body;
    if(req.decodedToken.UserId !== UserId){
        return res.status(403).send("You do not have permission to do that");
    }
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



app.post("/chatMessage", verifyJWTMiddleware, (req, res)=>{
    const {SenderUserId, ReceiverUserId, Message} = req.body;
    if(req.decodedToken.UserId !== SenderUserId){
        return res.status(403).send("You do not have permission to do that");
    }
    queryTheDatabaseWithCallback("INSERT INTO ChatMessage (SenderUserId, ReceiverUserId, Message) VALUES (?,?,?)", [SenderUserId, ReceiverUserId, Message], res, (results)=>{
        io.to(`UserId_${ReceiverUserId}`).emit("newMessage", { SenderUserId, ReceiverUserId, Message, ChatMessageId:results.insertId, SentAt:new Date().toISOString()});
        res.send(results);
    }); 
})


app.get("/chatMessages", verifyJWTMiddleware, (req, res)=>{
    const {UserId1, UserId2} = req.query;
    if(req.decodedToken.UserId !== parseInt(UserId1) && req.decodedToken.UserId !== parseInt(UserId2) ){
        return res.status(403).send("You do not have permission to do that");
    }
    queryTheDatabaseWithCallback("SELECT * FROM ChatMessage WHERE (SenderUserId = ? AND ReceiverUserId = ?) OR (SenderUserId = ? AND ReceiverUserId = ?) ORDER BY SentAt", [UserId1, UserId2, UserId2, UserId1], res, (results)=>{
        res.send(results)
    });
})
app.get("/notifications", verifyJWTMiddleware, (req,res)=>{
    const {UserId, Dropdown, getUnreadCount} = req.query;
    if(req.decodedToken.UserId !== parseInt(UserId)){
        return res.status(403).send("You do not have permission to do that");
    }
    db.query("SELECT VideoPost.UserId AS 'VideoPostReceiverUserId', VideoPostComments.UserId AS 'VideoCommentSenderUserId', VideoPost.VideoPostId AS 'VideoPostId', VideoPostComments.VideoPostCommentId as 'SenderVideoPostCommentId', VideoPostComments.Comment AS 'Message', VideoPostComments.CommentedAt AS 'CommentedAt', VideoPostComments.DELETED AS 'DELETED', VideoPostComments.NotificationRead AS 'NotificationRead' FROM VideoPost INNER JOIN VideoPostComments ON VideoPostComments.VideoPostId = VideoPost.VideoPostId WHERE VideoPostComments.ReplyToVideoPostCommentId IS NULL AND VideoPostComments.UserId != VideoPost.UserId AND VideoPost.UserId = ?;", [UserId], (err, results)=>{
        if(err){
            console.log(err);
            res.status(500).send("Internal Server Server");
        }
        db.query("SELECT v1.UserId as 'VideoCommentSenderUserId', v2.UserId as 'VideoCommentReceiverUserId', v1.Comment as 'Message', v1.CommentedAt as 'CommentedAt', v1.VideoPostId as 'VideoPostId', v1.DELETED as 'DELETED', v1.NotificationRead as 'NotificationRead', v1.VideoPostCommentId as 'SenderVideoPostCommentId', v2.VideoPostCommentId as 'ReceiverVideoPostCommentId' FROM VideoPostComments v1 JOIN VideoPostComments v2 ON v1.ReplyToVideoPostCommentId = v2.VideoPostCommentId WHERE v1.UserId!=v2.UserId AND v2.UserId = ?;", [UserId], (err1, results1)=>{
            if(err1){
                console.log(err1)
                res.status(500).send("Internal Server Error");
            }
            db.query("SELECT u1.id AS 'ForumPostReceiverUserId', u2.id AS 'ForumCommentSenderUserId', ForumPost.id AS 'ForumPostId', ForumPostComments.id AS 'SenderForumPostCommentId', ForumPostComments.body AS 'Message', ForumPostComments.comment_timestamp AS 'CommentedAt', ForumPostComments.NotificationRead AS 'NotificationRead' FROM ForumPost INNER JOIN ForumPostComments ON ForumPostComments.forum_post_id = ForumPost.id LEFT JOIN users AS u1 ON ForumPost.username = u1.username LEFT JOIN users AS u2 ON ForumPostComments.username = u2.username WHERE ForumPostComments.parent_comment_id IS NULL AND u1.id != u2.id AND u1.id = ?", [UserId], (err2, results2)=>{
                if(err2){
                    console.log(err2);
                    res.status(500).send("Internal Server Error");
                }
                db.query("SELECT u1.id as 'ForumCommentSenderUserId', u2.id as 'ForumCommentReceiverUserId', v1.body as 'Message', v1.comment_timestamp as 'CommentedAt', v1.forum_post_id as 'ForumPostId', v1.NotificationRead as 'NotificationRead', v1.id as 'SenderForumPostCommentId', v2.id as 'ReceiverForumPostCommentId' FROM ForumPostComments AS v1 INNER JOIN ForumPostComments AS v2 ON v1.parent_comment_id = v2.id LEFT JOIN users AS u1 ON v1.username = u1.username LEFT JOIN users as u2 ON v2.username = u2.username WHERE v1.username != v2.username AND u2.id = ?;", [UserId], (err3,results3)=>{
                    if(err3){
                        console.log(err3);
                        res.status(500).send("Internal Server Error");
                    }
                    if(!Dropdown){
                        let sendThis = [...results, ...results1, ...results2, ...results3];
                        sendThis.forEach((comment)=>{
                            comment.CommentedAtDateObject = new Date(comment.CommentedAt)
                        })
                        sendThis.sort((a, b) => b.CommentedAtDateObject - a.CommentedAtDateObject);
                        res.send(sendThis);
                    }
                    else {
                        let sendThis = [...results, ...results1, ...results2, ...results3];
                        let UnreadCount =0;
                        if(getUnreadCount){
                            sendThis.forEach((element)=>{
                                if(element.NotificationRead===0){
                                    UnreadCount++;
                                }
                            })
                        }
                        sendThis.forEach((comment)=>{
                            comment.CommentedAtDateObject = new Date(comment.CommentedAt)
                        })
                        sendThis.sort((a, b) => b.CommentedAtDateObject - a.CommentedAtDateObject);
                        sendThis = sendThis.slice(0,10);

                        if(getUnreadCount){
                            res.send({UnreadNotifications: UnreadCount});
                        }
                        else {
                            res.send(sendThis);
                        }
                        
                    }
                } )
            })
        })
    } )
    
});
app.patch("/notifications", verifyJWTMiddleware, async (req,res)=>{
    const {ForumPostCommentId, VideoPostCommentId}= req.body;
    if(VideoPostCommentId){
        const parent = await queryTheDatabaseGiveResults("SELECT ReplyToVideoPostCommentId, VideoPostId FROM VideoPostComments WHERE VideoPostCommentId = ?",[VideoPostCommentId]);
        if(parent.length === 1){
            if(parent[0].ReplyToVideoPostCommentId===null){
                const authorizedUserId = (await queryTheDatabaseGiveResults("SELECT UserId FROM VideoPost WHERE VideoPostId = ?", [parent[0].VideoPostId]))[0].UserId;
                if(req.decodedToken.UserId!==authorizedUserId){
                    return res.status(403).send("You do not have permission to do that");
                }
            }
            else {
                const authorizedUserId = (await queryTheDatabaseGiveResults("SELECT UserId FROM VideoPostComments WHERE VideoPostCommentId = ?", [parent[0].ReplyToVideoPostCommentId]))[0].UserId; 
                if(req.decodedToken.UserId!==authorizedUserId){
                    return res.status(403).send("You do not have permission to do that");
                }
            }
        }
        else {
            return res.status(400).send("That doesnt exist.")
        }

    }
    else if(ForumPostCommentId){
        const parent = await queryTheDatabaseGiveResults("SELECT parent_comment_id, forum_post_id FROM ForumPostComments WHERE id = ?",[ForumPostCommentId]);
        if(parent.length === 1){
            if(parent[0].parent_comment_id===null){
                const authorizedUsername = (await queryTheDatabaseGiveResults("SELECT username FROM ForumPost WHERE id = ?", [parent[0].forum_post_id]))[0].username;
                if(req.decodedToken.username!==authorizedUsername){
                    return res.status(403).send("You do not have permission to do that");
                }
            }
            else {
                const authorizedUsername = (await queryTheDatabaseGiveResults("SELECT username FROM ForumPostComments WHERE id = ?", [parent[0].parent_comment_id]))[0].username; 
                if(req.decodedToken.username!==authorizedUsername){
                    return res.status(403).send("You do not have permission to do that");
                }
            }
        }
        else {
            return res.status(400).send("That doesnt exist.")
        }
    }
    else {
        return res.send("You must have one of the following");
    }
    if(VideoPostCommentId){
        queryTheDatabase("UPDATE VideoPostComments SET NotificationRead = ? WHERE VideoPostCommentId = ?", [true, VideoPostCommentId], res);
    }
    else if(ForumPostCommentId){
        queryTheDatabase("UPDATE ForumPostComments SET NotificationRead = ? WHERE id = ?", [true, ForumPostCommentId], res);
    }
})

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});