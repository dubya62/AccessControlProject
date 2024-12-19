var parsedUrl = new URL(window.location.href);

function query() {
    fetch("http://" + parsedUrl.host + "/query", {
        method: "GET",
        mode: "no-cors",
    })
    .then((resp) => resp.text())
    .then((data) => {
        document.getElementById("response").innerHTML = data;
    })
    .catch((err) => {
        console.log(err);
    })
}

function login() {
    let stringifiedBody = JSON.stringify({
        username: document.getElementById("username").value,
        password: document.getElementById("password").value
    });
    console.log(stringifiedBody);
    fetch("http://" + parsedUrl.host + "/login", {
        method: "POST",
        mode: "no-cors",
        headers: {
            "Content-Type": "application/json",
        },
        body: stringifiedBody 
    })
    .then((resp) => resp.text())
    .then((_resp) => {
        if (resp.status = 500) {
            console.log("Server Error");
            alert("Server Error");
        } 
        else if (resp.status = 401) {
            console.log("Username or password incorrect");
            alert("Username and password incorrect");
        } 
        else if (resp.status = 415) {
            console.log("Incomplete Request");
            alert("Incomplete Request"); 
        }
        else {
            location.href = "http://" + parsedUrl.host + "/query.html";
        }
    })
    .catch ((err) => {
        console.log(err)
        if (resp.status = 500) {
            console.log("Server Error");
            alert("Server Error");
        } else if (resp.status = 401) {
            console.log("Username or password incorrect");
            alert("Username or passwor incorrect");
        } else {
            console.log("Unknown Error");
            alert("Unknown Error");
        }
    })
}