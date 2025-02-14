require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");


const TOTP = String(process.env.TOTP);
const PORT = String(process.env.PORT);
const HOST = String(process.env.HOST);
const MYSQLHOST = String(process.env.MYSQLHOST);
const MYSQLUSER = String(process.env.MYSQLUSER);
const MYSQLPASS = String(process.env.MYSQLPASS);
const PEPPER = String(process.env.PEPPER);
const JWTSECRET = String(process.env.JWTSECRET); // Secret key for JWT

const app = express();

app.use(express.json());

app.use(cors({
    origin: "http://localhost:8003",
    methods: ["GET, POST, PUT, DELETE, OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

app.options("*", cors());

// MySQL connection setup
let connection = mysql.createConnection({
  host: MYSQLHOST,
  user: MYSQLUSER,
  password: MYSQLPASS,
  database: "users"
});


// /login route to authenticate and return a JWT token
app.post("/login", function (request, response) {
    let parsedBody = request.body;
    console.log(`request body: ${parsedBody}`);
    if (!parsedBody.hasOwnProperty("username")) {
        console.log("no username provided");
        return response.status(415).send("Incomplete Request");
    }


    let SQL = "SELECT * FROM users WHERE username='" + parsedBody["username"] + "';";
    connection.query(SQL, [true], (error, results, fields) => {


        if (error) {
            return response.status(500).send("Server Error");
        }
        if (results.length == 0) {
            return response.status(401).send("Unauthorized");
        }

        console.log(results);

        let combinedPass = results[0]["salt"] + parsedBody["password"] + PEPPER;
        bcrypt.compare(combinedPass, results[0]["password"], function(err, result) {
            console.log("Compared...");
            if (!result) {
                return response.status(401).send("Unauthorized");
            }


            // Create JWT token
            const token = jwt.sign({ username: results[0].username, email: results[0].email, role: results[0].role }, JWTSECRET, { expiresIn: '1h' });
            return response.json({ token }); // Send the JWT token to the client
        });
    });
});

// Function to check if character is numeric (used for TOTP calculation)
function isNumeric(character) {
    return !isNaN(character);
}


// /totp route to validate TOTP (unchanged)
app.post("/totp", function (request, response) {
    let parsedBody = request.body;
    if (!parsedBody.hasOwnProperty("totp")) {
        return response.status(415).send("Incomplete Request");
    }

    let currentTime = Date.now() / 1000;
    currentTime -= currentTime % 30; // Round to nearest 30 seconds
    let unhashedMessage = TOTP + currentTime;
    let hash = bcrypt.hashSync(unhashedMessage, "$2b$10$GFc0IUQnyJtGuTpWUAPg.u");

    let result = "";
    let resultLength = 6;
    let j = 29;
    while (result.length < resultLength) {
        if (isNumeric(hash[j])) {
            result += hash[j];
        }
        j++;
    }
    console.log("Generated TOTP:", result);
    console.log("Received TOTP:", parsedBody["totp"]);
    console.log("Match Status:", result === parsedBody["totp"])
    if (result === parsedBody["totp"]) {
        return response.status(200).json({ success: true, message: "TOTP Validated" });
    } else {
        return response.status(401).json({ success: false, message: "Unauthorized" });
    }
});


/*app.post("/createUser", function (request, response) { 
    console.log(request.body)
    let {username, password} = request.body;

    let query = "INSERT INTO users (username, password, role, salt, email) VALUES (?, ?, 'admin', '7ezb', 'in@example.com')";
    let saltedPassword = "7ezb" + password + PEPPER;

    console.log(`${query}`);
    console.log(`username: ${username}`);
    console.log(`salted: ${saltedPassword}`);

    bcrypt.hash(saltedPassword, 10, (err, hash) => {
        connection.query(query, [username, hash], (error, results, fields) => {
            console.log(`hash: ${hash}`);
            if (error){
                console.log(error);
                return response.status(500).send("Database error.");
            }
            return response.status(200).send("success?");
        });
    });
}); */

// function to register a new user
 app.post("/register", function (request, response) { 
    console.log(request.body);

    // grab username and password
    let {username, password, email} = request.body;

    // if the information is missing, fail
    if (!username || !password || !email) {
        return response.status(400).send("Missing required fields.");
    }

    // check if username already exists
    connection.query("SELECT * FROM users WHERE username = ?", [username], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return response.status(500).send("Database error.");
        }
        if (results.length > 0) {
            return response.status(409).send("Username already taken.");
        }

        // generate salt and hash the password
        let salt = bcrypt.genSaltSync(10);
        let saltedPassword = salt + password + PEPPER;

        bcrypt.hash(saltedPassword, 10, (err, hash) => {
            if (err){
                console.error("Hashing error:", err);
                return response.status(500).send("Password error.");
            }

            // insert new user into the database
            let query = "INSERT INTO users (username, password, role, salt, email) VALUES (?, ?, 'user', ?, ?)";
            connection.query(query, [username, hash, role, salt, email], (error, results) => {
                if (error) {
                    console.error("Database error:", error);
                    return response.status(500).send("Registration failed.");
                }

                console.log(`User ${username} registered successfully.`);
                return response.status(201).send("Registration successful.");
            });
        });
    });
});

// app.listen(PORT, HOST, () => {
//     console.log(`Running on http://${HOST}:${PORT}`);
// });
app.listen(PORT, () => console.log(`User-Management API running on port ${PORT}`));

