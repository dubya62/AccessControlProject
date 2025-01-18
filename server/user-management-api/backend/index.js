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
    origin: '*',
    credentials: false,
    optionSuccessStatus: 200
}));

/*
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', "http://localhost:8003");
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', false);
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    next();
});
*/

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

            // Validate TOTP
            let currentTime = Date.now() / 1000;
            currentTime -= currentTime % 30; // Round to nearest 30 seconds
            let unhashedMessage = TOTP + currentTime;
            let hash = bcrypt.hashSync(unhashedMessage, "$2b$10$GFc0IUQnyJtGuTpWUAPg.u");

            let computedTOTP = "";
            let resultLength = 6;
            let j = 29;
            while (computedTOTP.length < resultLength) {
                if (!isNaN(hash[j])) {
                    computedTOTP += hash[j];
                }
                j++;
            }

            console.log(`Given totp: ${parsedBody["totp"]}`)
            console.log(`Computed totp: ${computedTOTP}`)

            if (parsedBody["totp"] !== computedTOTP) {
                return response.status(401).send("Unauthorized");
            }

            // Create JWT token
            const token = jwt.sign({ username: results[0].username, email: results[0].email }, JWTSECRET, { expiresIn: '1h' });
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

    if (result === parsedBody["totp"]) {
        return response.status(200).send("Success");
    } else {
        return response.status(401).send("Unauthorized");
    }
});

app.listen(PORT, HOST, () => {
    console.log(`Running on http://${HOST}:${PORT}`);
});

