const {Router} = require('express')
const { createBoardController, getBoardsController,getBoardController,updateBoardStrokesController,deleteBoardController,addCollaboratorController } = require('../controllers/board.controller')
const authMiddleware = require('../middlewares/auth.middleware')
const boardRouter = Router()

/**
 * @route POST/api/board/CreateBoard
 * @description crete a new board
 * @access private
 * 
 */
boardRouter.post('/CreateBoard', authMiddleware.authUser, createBoardController)
/**
 * @route GET/api/board/getBoards
 * @description get all boards of the user
 * @access private
 * 
 */
boardRouter.get('/getBoards', authMiddleware.authUser, getBoardsController)

/**
 * @route GET/api/board/:boardId
 * @description get the chosen board of the user
 * @access private
 * 
 */

boardRouter.get('/:boardId', authMiddleware.authUser, getBoardController)


/**
 * @route PUT/api/board/:boardId/strokes
 * @description accepts a strokes array in the body and updates that board's strokes field in MongoDB
 * @access private
 * 
 */

boardRouter.put('/:boardId/strokes', authMiddleware.authUser, updateBoardStrokesController)

/**
 * @route DELETE/api/board/:boardId
 * @description delete a board owned by the user
 * @access private
 * 
 */
boardRouter.delete('/:boardId', authMiddleware.authUser, deleteBoardController)

/**
 * @route post/api/board//:boardId/collaborators
 * @description collaborate to another user
 * @access private
 * 
 */

boardRouter.post('/:boardId/collaborators', authMiddleware.authUser, addCollaboratorController)





module.exports=boardRouter