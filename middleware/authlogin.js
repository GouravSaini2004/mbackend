const { validatetoken } = require("../service/auth");

function checklogin(token){
    const userpayload = validatetoken(token);
    return userpayload
   
}

module.exports = checklogin;