const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const TOTP = String(process.env.TOTP);
const PORT = String(process.env.PORT);
const HOST = String(process.env.HOST);
const MYSQLHOST = String(process.env.MYSQLHOST);
const MYSQLUSER = String(process.env.MYSQLUSER);
const MYSQLPASS = String(process.env.MYSQLPASS);
const PEPPER = String(process.env.PEPPER);
const JWTSECRET = String(process.env.JWTSECRET);

const app = express();
app.use(express.json());

// MySQL connection setup
let connection = mysql.createConnection({
  host: MYSQLHOST,
  user: MYSQLUSER,
  password: MYSQLPASS,
  database: "new_database"
});

// Serve static files
app.use("/", express.static("frontend"));

// Middleware to authenticate token
function authenticateToken(request, response, next) {
    const authHeader = request.header('Authorization');
    const token = authHeader;
    console.log(`AuthHeader: ${authHeader}`);
    if (!token) {
        return response.status(403).send('No token provided');
    }

    jwt.verify(token, JWTSECRET, (err, user) => {
      console.log(user);
        if (err) {
            return response.status(403).send('Invalid or expired token');
        }
        request.user = user;
        next();
    });
}

// /query route for Data API
app.get("/query", authenticateToken, (request, response) => {
  // verify the token
  console.log("Attempt at query");
  authenticateToken(request, response, () => {
      let SQL = "SELECT * FROM products;";
      connection.query(SQL, (error, results) => {
        if (error) {
          console.error(error.message);
          response.status(500).send("Database error");
        } else {
          response.send(results);
        }
      });
  });

});



/*
// /login route for User Management API
app.post("/login", (request, response) => {
  let { username, password } = request.body;
  if (!username) {
    return response.status(400).send("Incomplete Request");
  }
  
  let SQL = "SELECT * FROM users WHERE username=?";
  connection.query(SQL, [username], (error, results) => {
    if (error) {
      return response.status(500).send("Server Error");
    }
    if (results.length === 0) {
      return response.status(401).send("Unauthorized");
    }

    let user = results[0];
    let combinedPass = user.salt + password + PEPPER;

    bcrypt.compare(combinedPass, user.password, (err, match) => {
      if (err || !match) {
        return response.status(401).send("Unauthorized");
      }

      // Generate JWT
      const token = jwt.sign(
        { email: user.email, username: user.username },
        JWTSECRET,
        { expiresIn: '1h' }
      );
      response.status(200).send({ token });
    });
  });
});

// /validateToken route for User Management API 
app.post("/validateToken", (request, response) => {
  // Extract token from Authorization header
  const authHeader = request.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"
  
  if (!token) {
    return response.status(400).send('No token provided');
  }

  // Verify the token
  jwt.verify(token, JWTSECRET, (err, user) => {
    if (err) {
      return response.status(403).send('Invalid or expired token');
    }
    
    // Send back the user information if token is valid
    response.status(200).send(user); // Send the decoded user info (username, email, etc.)
  });
});
*/

app.listen(PORT, HOST, () => {
  console.log(`Running on http://${HOST}:${PORT}`);
});

