var parsedUrl = new URL(window.location.href);

// Helper function to get cookies
function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith(name + '=')) {
            return cookie.substring(name.length + 1);
        }
    }
    return null;
}

function query(endpoint) {
    // Retrieve the JWT token from cookies
    let token = getCookie('jwtToken');

    console.log(`token: ${token}`);

    if (!token) {
        alert('You are not logged in. Please log in first.');
        return;
    }

    fetch("http://" + parsedUrl.host + "/" + endpoint, {
        method: "GET",
        headers: {
            "Accept": "application/json",
            "Authorization": 'Bearer ${token}'
        }
    })
    .then((resp) => {
        console.log('Response from ${endpoint}:', resp);
        if (!resp.ok) {
            return resp.text().then(text => { throw new Error('Error ${resp.status}: ${text}'); });
        }
        return resp.json()
    })
    .then((data) => {
        console.log('Query Results from ${endpoint};', data)
        console.log(`HERE 1`);
        console.log(`data: ${data}`)
        document.getElementById("response").innerHTML = JSON.stringify(data, null, 2);
    })
    .catch((err) => {
        console.log(err);
    });
}

function login() {
    let stringifiedBody = JSON.stringify({
        username: document.getElementById("username").value,
        password: document.getElementById("password").value,
    });

    console.log(stringifiedBody);

    console.log(`http://${parsedUrl.hostname}:8004/login`);
    fetch("http://" + parsedUrl.hostname + ":8004/login", {
        method: "POST",
        mode: "cors",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        body: stringifiedBody
    })
    .then((_resp) => {
        if (_resp.status == 500) {
            console.log("Server Error");
            alert("Server Error");
        } else if (_resp.status == 401) {
            console.log("Username or password incorrect");
            alert("Username and password incorrect");
        } else if (_resp.status == 415) {
            console.log("Incomplete Request");
            alert("Incomplete Request"); 
        } else if (_resp.status == 200) {
            return _resp.json();  // Return the JSON response
        } else {
            console.log("Unknown Response Status: " + _resp.status);
            alert("Unknown response from server.");
        }
    })
    .then((data) => {
        if (data && data.token) {
            // Store the JWT token in the cookie
            document.cookie = "jwtToken=" + data.token + "; path=/; secure; samesite=strict";
            location.href = "http://" + parsedUrl.host + "/totp.html";
        } else {
            console.log("No token received");
            alert("Login failed. No token received.");
        }
    })
    .catch((err) => {
        console.log(err);
        alert("An error occurred. Please try again.");
    });
}


function totp() {
    let stringifiedBody = JSON.stringify({
        totp: document.getElementById("totp").value
    });

    // Retrieve the JWT token from cookies
    let token = getCookie('jwtToken');
    if (!token) {
        alert('You are not logged in. Please log in first.');
        return;
    }

    fetch("http://" + parsedUrl.hostname + ":8004/totp", {
        method: "POST",
        mode: "cors",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token  // Add JWT token in the Authorization header
        },
        body: stringifiedBody
    })
    .then((_resp) => {
        if (_resp.status == 500) {
            console.log("Server Error");
            alert("Server Error");

        } else if (_resp.status == 401) {
            console.log("Incorrect TOTP");
            alert("Incorrect TOTP");

        } else if (_resp.status == 200) {
            location.href = "http://" + parsedUrl.host + "/query.html";
        } else if (_resp.status == 204) {
            location.href = "http://" + parsedUrl.host + "/query.html";
        } else {
            console.log("Unknown Response Status: " + _resp.status);
            alert("Unknown response from server.");
        }
    })
    .catch((err) => {
        console.log(err);
        alert("An error occurred. Please try again.");
    });
}

