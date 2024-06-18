const {Schema, model} = require("mongoose")

const likeSchema = new Schema({
    blogid: {
        type: Schema.Types.ObjectId,
        ref: "blog"
    },
    userid: {
        type: Schema.Types.ObjectId,
        ref: "user"
    }
},{timestamps: true})

const Like = model("like", likeSchema)
module.exports = Like;