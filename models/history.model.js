const {Schema, model}= require("mongoose");


const historySchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  blogId: {
    type: Schema.Types.ObjectId,
    ref: 'blog',
    required: true
  }
},{timestamps: true});

const History = model('userhistories', historySchema);

module.exports = History;
