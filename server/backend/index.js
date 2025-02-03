const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors")

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

app.use(cors({ 
  origin: "http://localhost:8003",
  methods: "GET, POST, PUT, DELETE",
  credentials: true
}));

// Middleware to authenticate token
function authenticateToken(request, response, next) {
    const authHeader = request.header('Authorization');
    const token = authHeader.replace("Bearer ", "");
    console.log(`AuthHeader: ${authHeader}`);
    if (!token) {
        return response.status(403).send('No token provided');
    }

    jwt.verify(token, JWTSECRET, (err, user) => {
        console.log("User");
        console.log(user);
        if (err) {
            return response.status(403).send('Invalid or expired token');
        }
        request.user = user;
        next(user);
    });
}

function insertLog(who, what, success){
    console.log(`Creating log: ${who}, ${what}, ${success}`);
    let SQL = "INSERT INTO logs (username, action, success) VALUES (?, ?, ?)";
    connection.query(SQL, [who, what, success], (error, results) => {
        if (error){
            console.log(error.message);
            return;
        }
    });
}

// /query route for Data API
app.get("/queryProducts", (request, response) => {
  // verify the token
  console.log("Attempt at query");
  authenticateToken(request, response, (token) => {
      let SQL = "SELECT * FROM products;";
      connection.query(SQL, (error, results) => {
        if (error) {
          console.error(error.message);
          insertLog(token["username"], "Get Products", true);
          response.status(500).send("Database error");
        } else {
          insertLog(token["username"], "Get Products", false);
          response.status(200).send(results);
        }
      });
  });

});

app.get("/queryOrders", (request, response) => {
  // verify the token
  console.log("Attempt at query");
  authenticateToken(request, response, (token) => {
      let SQL = "SELECT * FROM orders;";
      connection.query(SQL, (error, results) => {
        if (error) {
          console.error(error.message);
          insertLog(token["username"], "Get Orders", false);
          response.status(500).send("Database error");
        } else {
          if (token["role"] == "admin"){
            insertLog(token["username"], "Get Orders", true);
            response.status(200).send(results);
          } else {
            insertLog(token["username"], "Get Orders", false);
            response.status(403).send("Forbidden");
          }
        }
      });
  });

});

app.get("/queryReviews", (request, response) => {
  // verify the token
  console.log("Attempt at query");
  authenticateToken(request, response, (token) => {
      let SQL = "SELECT * FROM reviews;";
      connection.query(SQL, (error, results) => {
        if (error) {
          console.error(error.message);
          insertLog(token["username"], "Get Orders", false);
          response.status(500).send("Database error");
        } else {
          if (token["role"] == "admin"){
            insertLog(token["username"], "Get Orders", true);
            response.status(200).send(results);
          } else {
            insertLog(token["username"], "Get Orders", false);
            response.status(403).send("Forbidden");
          }
        }
      });
  });
});

app.get("/getLogs", (request, response) => {
  console.log("Attempt at query");
  authenticateToken(request, response, (token) => {
      let SQL = "SELECT * FROM logs;";
      connection.query(SQL, (error, results) => {
        if (error) {
          console.error(error.message);
          insertLog(token["username"], "Get Logs", false);
          response.status(500).send("Database error");
        } else {
          if (token["role"] == "admin"){
            insertLog(token["username"], "Get Logs", true);
            console.log("Returning logs.");
            response.status(200).send(results);
          } else {
            insertLog(token["username"], "Get Logs", false);
            response.status(403).send("Forbidden");
          }
        }
      });
  });
});

app.listen(PORT, HOST, () => {
  console.log(`Running on http://${HOST}:${PORT}`);
});

