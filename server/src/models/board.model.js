const mongoose= require('mongoose')

const boardSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      default: 'Untitled Board',
    },
    strokes: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
)
 
const Board = mongoose.model('Board', boardSchema)
 
module.exports = Board