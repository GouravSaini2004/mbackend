const {Schema, model}= require("mongoose");

const commentSchema = new Schema({
    comment: {
        type: String,
        required: true,    
    },
    blogid: {
        type: Schema.Types.ObjectId,
        ref: "blog",
    },
    createdby: {
        type: Schema.Types.ObjectId,
        ref: "user",
    },
},{timestamps: true})

const Comment = model("comment", commentSchema);
module.exports = Comment