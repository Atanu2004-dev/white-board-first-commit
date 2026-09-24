const Board = require('../models/board.model')
const User = require('../models/user.model')


/**
 * @name createBoardController
 * @description create a new board,
 * @access Private 
 */
const createBoardController = async (req, res) => {
    console.log('req.user:', req.user);
  try {
    const owner = req.user.id
    const { title } = req.body

    const board = await Board.create({
      owner,
      ...(title && { title }),
    })

    res.status(201).json(board)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

/**
 * @name getBoardsController
 * @description give all boards of the user
 * @access Private 
 */

const getBoardsController = async (req, res) => {
  try {
    const owner = req.user.id

    const boards = await Board.find({ 
      owner
    }).sort({ updatedAt: -1 })

    res.status(200).json(boards)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

/**
 * @name getBoardController
 * @description get a single board by id, including its saved strokes
 * @access Private
 */
const getBoardController = async (req, res) => {
  try {
    const userId = req.user.id
    const { boardId } = req.params
    console.log('boardId:', boardId)
    console.log('owner:', userId)
    const boardExists = await Board.findById(boardId)
    console.log('board exists (any owner):', boardExists)
 
    const board = await Board.findOne({ 
      _id: boardId,
      $or: [{ owner: userId }, { collaborators: userId }]
    })
 
    if (!board) {
      return res.status(404).json({ message: 'Board not found' })
    }
 
    res.status(200).json(board)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

/**
 * @name updateBoardStrokesController
 * @description save/overwrite the strokes array for a single board
 * @access Private
 */
const updateBoardStrokesController = async (req, res) => {
  try {
    const userId  = req.user.id
    const { boardId } = req.params
    const { strokes } = req.body
 
    const board = await Board.findOneAndUpdate(
      { _id: boardId, $or: [{ owner: userId }, { collaborators: userId }] },
      { strokes },
      { new: true }
    )
 
    if (!board) {
      return res.status(404).json({ message: 'Board not found' })
    }
 
    res.status(200).json(board)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
/**
 * @name deleteBoardController
 * @description delete a board 
 * @access Private
 */

const deleteBoardController = async (req, res) => {
  try {
    const owner = req.user.id
    const { boardId } = req.params
 
    const board = await Board.findOneAndDelete({ _id: boardId, owner })
 
    if (!board) {
      return res.status(404).json({ message: 'Board not found' })
    }
 
    res.status(200).json({ message: 'Board deleted successfully' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

/**
 * @name addCollaboratorController
 * @description add another user as a collaborator on this board (owner only)
 * @access Private
 */

const addCollaboratorController = async (req, res) => {
  try {
    const owner = req.user.id
    const { boardId } = req.params
    const { email } = req.body

    const userToAdd = await User.findOne({ email })
    if (!userToAdd) {
      return res.status(404).json({ message: 'User not found' })
    }

    const board = await Board.findOneAndUpdate(
      { _id: boardId, owner },//security check-only current loged in user is valid
      { $addToSet: { collaborators: userToAdd.id } },
      { new: true }
    )

    if (!board) {
      return res.status(404).json({ message: 'Board not found' })
    }
    if (userToAdd.id.toString() === owner) {
      return res.status(400).json({ message: "You can't add yourself as a collaborator" })
    }

    res.status(200).json(board)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}



module.exports = { createBoardController, getBoardsController,getBoardController,updateBoardStrokesController,deleteBoardController,addCollaboratorController }