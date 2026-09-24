const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')

const app = express()
app.use(express.json())
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())
//require all the routes here
const authRouter = require('./routes/auth.routes')
const boardRouter=require('./routes/board.routes')
const inviteRouter=require('./routes/invite.routes')

//using all the routes here
app.use('/api/auth', authRouter)
app.use('/api/board', boardRouter)
app.use('/api/invites', inviteRouter)

module.exports=app