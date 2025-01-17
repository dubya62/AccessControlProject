
const bcrypt = require("bcrypt");

const TOTP = String(process.env.TOTP);

function isNumeric(character){
    return !isNaN(character);
}

function get_totp(){
    // get current time and round to nearest 30 seconds
    let currentTime = Date.now() / 1000; 
    currentTime -= currentTime % 30; // round to nearest 30 seconds
    console.log(currentTime);

    // convert to string and append it to the env var
    let unhashedMessage = "" + TOTP + currentTime;
    
    console.log(unhashedMessage);

    // hash the message (10 passes)
    let hash = bcrypt.hashSync(unhashedMessage, "$2b$10$GFc0IUQnyJtGuTpWUAPg.u");
    console.log(hash);

    // get the first six numeric characters
    let result = "";
    let result_length = 6;

    let i = 0;
    let j = 29;
    while (i < result_length){
        while (j < hash.length){
            // if found character is numeric, add it to the result
            if (isNumeric(hash[j])){
                result += hash[j];
                j++;
                break;
            }
            j++;
        }

        // if out of numeric characters, we are done
        if (j == hash.length){
            break;
        }
        i++;
    }
    while (result.length <  result_length){
        result += "0";
    }

    // compare the computed result to the given result
    console.log("Computed: " + result);
}

get_totp()
