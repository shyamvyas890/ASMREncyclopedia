const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
const cors= require("cors");

const app = express();

const port = 3001;
const secretKey= "secret_key" //Will change this later

app.use(express.json())
app.use(express.urlencoded({ extended: true })); //Might not need this
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
                    const exp = Math.floor(Date.now() / 1000) + 1;
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

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });