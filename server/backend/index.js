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
        console.log("User");
        console.log(user);
        if (err) {
            return response.status(403).send('Invalid or expired token');
        }
        request.user = user;
        next(user);
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
          response.status(500).send("Database error");
        } else {
          response.send(results);
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
          response.status(500).send("Database error");
        } else {
          if (token["role"] == "admin"){
            response.send(results);
          } else {
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
          response.status(500).send("Database error");
        } else {
          if (token["role"] == "admin"){
            response.send(results);
          } else {
            response.status(403).send("Forbidden");
          }
        }
      });
  });

});


app.listen(PORT, HOST, () => {
  console.log(`Running on http://${HOST}:${PORT}`);
});

