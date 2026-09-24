const Invite = require('../models/invite.model')
const Board = require('../models/board.model')
const User = require('../models/user.model')

const INVITE_DURATION_MINUTES = 10

/**
 * @name createInviteController
 * @description owner sends an invite to another user by email
 * @access Private
 */
const createInviteController = async (req, res) => {
  try {
    const owner = req.user.id
    const { boardId } = req.params
    const { email } = req.body

    const board = await Board.findOne({ _id: boardId, owner })
    if (!board) {
      return res.status(404).json({ message: 'Board not found' })
    }

    const invitedUser = await User.findOne({ email })
    if (!invitedUser) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (invitedUser._id.toString() === owner) {
      return res.status(400).json({ message: "You can't invite yourself" })
    }

    if (board.collaborators.includes(invitedUser.id)) {
      return res.status(400).json({ message: 'User is already a collaborator' })
    }

    // agar already pending invite hai isi user + board ke liye, purana hata do
    await Invite.deleteMany({ board: boardId, invitedUser: invitedUser._id, status: 'pending' })

    const invite = await Invite.create({
      board: boardId,
      invitedBy: owner,
      invitedUser: invitedUser._id,
      status: 'pending',
      expiresAt: new Date(Date.now() + INVITE_DURATION_MINUTES * 60 * 1000),
    })

    const populatedInvite = await invite.populate([
      { path: 'board', select: 'title' },
      { path: 'invitedBy', select: 'username email' },
    ])

    // real-time notify karo agar user online hai (socket logic niche)
    const io = req.app.get('io')
    io.to(`user:${invitedUser._id}`).emit('new-invite', populatedInvite)

    res.status(201).json(populatedInvite)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

/**
 * @name getPendingInvitesController
 * @description get all pending invites for the logged-in user (for when they log in / open app)
 * @access Private
 */
const getPendingInvitesController = async (req, res) => {
  try {
    const userId = req.user.id

    const invites = await Invite.find({
      invitedUser: userId,
      status: 'pending',
      expiresAt: { $gt: new Date() }, // abhi tak expire nahi hua
    })
      .populate('board', 'title')
      .populate('invitedBy', 'username email')
      .sort({ createdAt: -1 })

    res.status(200).json(invites)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

/**
 * @name respondToInviteController
 * @description accept or reject a pending invite
 * @access Private
 */


const respondToInviteController = async (req, res) => {
  try {
    const userId = req.user.id
    const { inviteId } = req.params
    const { action } = req.body // 'accept' | 'reject'

    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' })
    }

    const invite = await Invite.findOne({ _id: inviteId, invitedUser: userId, status: 'pending' })
    if (!invite) {
      return res.status(404).json({ message: 'Invite not found or already responded to' })
    }

    if (invite.expiresAt < new Date()) {
      invite.status = 'expired'
      await invite.save()
      return res.status(410).json({ message: 'This invite has expired' })
    }

    if (action === 'accept') {
      await Board.findByIdAndUpdate(invite.board, {
        $addToSet: { collaborators: userId },
      })
      invite.status = 'accepted'
    } else {
      invite.status = 'rejected'
    }

    await invite.save()

    res.status(200).json({ message: `Invite ${invite.status}`, invite })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

module.exports = {
  createInviteController,
  getPendingInvitesController,
  respondToInviteController,
}