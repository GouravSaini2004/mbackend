const JWT = require("jsonwebtoken");

const secret = "#saini@468728";

function createtoken(user){
    const payload = {
        _id: user._id,
        email: user.email,
        profileimageurl: user.profileimageurl,
        fullname: user.fullname,
        password: user.password
    };

    const token = JWT.sign(payload, secret);
    return token;
}

function validatetoken(token){
    const payload = JWT.verify(token, secret);
    return payload;
}

module.exports = {validatetoken, createtoken};