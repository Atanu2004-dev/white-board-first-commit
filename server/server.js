const http = require('http')
const { Server } = require('socket.io')
require("dotenv").config()
const app=require("./src/app.js")

const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
})
app.set('io', io)

const connectToDB= require("./src/config/database.js")
require('./src/sockets/board.socket')(io)

connectToDB()

const PORT = process.env.PORT || 3000
server.listen(3000,()=>{
    console.log("Server is running on port 3000")
})