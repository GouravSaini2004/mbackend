const {Schema, model}= require("mongoose");
const { createHmac, randomBytes } = require('node:crypto');
const { createtoken } = require("../service/auth");

const userSchema = new Schema({
    fullname: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        require: true,
        unique: true,
    },
    salt: {
        type: String,
    },
    password: {
        type: String,
        require: true,
    },
    profileimageurl: {
        type: String,
        default: '/images/default.png'
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    }
},{timestamps:true});

userSchema.static("matchpassword", async function(email,password){
    const user =await this.findOne({ email });
    if(!user) throw new Error("user not found:")

    const salt = user.salt;
    const hashpassword = user.password;

    const userhase = createHmac("sha256", salt)
    .update(password)
    .digest("hex");

    if(hashpassword !== userhase ) throw new Error("incorrect password:")

    const token = createtoken(user);
    return token;
});

userSchema.pre('save', function(next){
    const user = this;
    if(!user.isModified('password')) return;

    const salt = randomBytes(16).toString();
    const hashpassword = createHmac('sha256', salt)
    .update(user.password)
    .digest('hex');

    this.salt = salt;
    this.password = hashpassword;

    next();
})

const User = model("user", userSchema);
module.exports = User;