const {Schema, model} = require("mongoose")

const viewSchema = new Schema({
    blogid: {
        type: Schema.Types.ObjectId,
        ref: "blog"
    },
},{timestamps: true})

const View = model("view", viewSchema)
module.exports = View;