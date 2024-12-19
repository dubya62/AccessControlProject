const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");


const PORT = String(process.env.PORT);
const HOST = String(process.env.HOST);
const MYSQLHOST = String(process.env.MYSQLHOST);
const MYSQLUSER = String(process.env.MYSQLUSER);
const MYSQLPASS = String(process.env.MYSQLPASS);
const PEPPER =    String(process.env.PEPPER);
const SQL = "SELECT * FROM users;"

const app = express();
app.use(express.json());


let connection = mysql.createConnection({
  host: MYSQLHOST,
  user: MYSQLUSER,
  password: MYSQLPASS,
  database: "users"
});


app.use("/", express.static("frontend"));


app.get("/query", function (request, response) {
  let SQL = "SELECT * FROM users;"
  connection.query(SQL, [true], (error, results, fields) => {
    if (error) {
      console.error(error.message);
      response.status(500).send("database error");
    } else {
      console.log(results);
      response.send(results);
    }
  });
})

app.post("/login", function (request, response) {
  let parsedBody = request.body;
  console.log(parsedBody);
  if (!parsedBody.hasOwnProperty("username")) {
    console.log("Incomplete Request");
    response.status(415).send("Incomplete Request");
  }
  let SQL = "SELECT * FROM users WHERE username=" + parsedBody["username"] + ";"
  connection.query(SQL, [true], (error, results, fields) => {
    if (error) {
      console.error("Database Error:\n", error.message);
      response.status(500).send("Server Error");
    } 
    else {
      if (results.length = 0) {
        console.log("User not found");
        response.status(401).send("Unauthorized"); 
      }
      else { 
        let combinedPass = results[0]["salt"] + parsedBody["password"] + PEPPER;
        bcrypt.compare(combinedPass, results[0]["password"], function(err, result) {
          if (err) {
            console.log("Password mismatch");
            response.status(401).send("Unauthorized");
          } 
          else {
            console.log(parsedBody["username"] + " logged in");
            response.status(200).send("Success");
          }
        });
      }
    }
  });
})


app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
