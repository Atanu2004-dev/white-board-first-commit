const mongoose = require('mongoose')

const inviteSchema = new mongoose.Schema(
  {
    board: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Board', 
      required: true },
    invitedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'users', 
      required: true },
    invitedUser: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'users',
      required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'expired'],
      default: 'pending',
    },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
)

// TTL index — MongoDB khud ye document delete kar dega expire hone ke kuch der baad
inviteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

const Invite = mongoose.model('Invite', inviteSchema)
module.exports = Invite