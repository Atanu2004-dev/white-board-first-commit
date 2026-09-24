const express = require('express')
const inviteRouter = express.Router()
const authMiddleware = require('../middlewares/auth.middleware')
const {createInviteController,getPendingInvitesController, respondToInviteController,} = require('../controllers/invite.controller')


/**
 * @route post/api/invites//board/:boardId
 * @description owner sends an invite to another user by email
 * @access private
 * 
 */
inviteRouter.post('/board/:boardId', authMiddleware.authUser, createInviteController)

/**
 * @route get/api/invites/board/pending
 * @description get all pending invites for the logged-in user (for when they log in / open app)
 * @access private
 * 
 */
inviteRouter.get('/pending', authMiddleware.authUser, getPendingInvitesController)

/**
 * @route POST/api/invites/:inviteId/respond
 * @description accept or reject a pending invite
 * @access private
 * 
 */
inviteRouter.post('/:inviteId/respond', authMiddleware.authUser, respondToInviteController)

module.exports = inviteRouter