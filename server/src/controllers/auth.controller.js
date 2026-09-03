const userModel = require('../models/user.model')
const bcrypt=require('bcryptjs')
const jwt = require('jsonwebtoken')
const tokenBlacklistmodel = require('../models/blacklist.model')
/**
 * @name registerUserController
 * @description Register a new user,expects username,email and password in the request body
 * @access Public 
 */
async function  registerUserController(req,res) {
    const {username, email, password} =req.body;//Request aati hai (username, email, password)

    if(!username || !email || !password){   //Validation — sab fields hain?
        return res.status(400).json({
            message:"Please provide username, email and password"
        })
    }

    const isUserAlreadyExits=await userModel.findOne({ //Database check — email/username already exist?
        $or:[{username},{email}]
    })
    
    if(isUserAlreadyExits){
        /*isUserAlreadyExists.username == username */
        return res.status(400).json({
            message:'Account already exits this email address and username'
        })
    }

    const hash= await bcrypt.hashSync(password,10) //10 yahan salt rounds hai Password hash karo

    const user = await userModel.create({ //Database mein naya user create kar rahe hain.
        username,
        email,
        password: hash
    })

    const token = jwt.sign( //User ke liye ek JWT token generat
        {id: user._id, username: user.username},
        process.env.JWT_SECRET,
        {expiresIn:"1d"}
    )

    res.cookie('token', token)//token ko browser ke cookie mein store kar rahe hain

    res.status(201).json({
        message:'User registered successfully',
        user:{
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}


/**
 * @name loginUserController
 * @description login a user, expects email and password in the request body
 * @access Public
 */

async function loginUserController(req,res) {
    const {email, password} = req.body
    const user = await userModel.findOne({email})

    if(!user){
        return res.status(400).json({
            message:'Invalid email or password'
        })
    }

    const isPasswordValid =await bcrypt.compare(password, user.password)//User ne jo plain password bheja hai (password), usko database mein saved hashed password

    if(!isPasswordValid){
        return res.status(400).json({
            message:'Invalid email or password'
        })
    }

    const token = jwt.sign(
        {id: user._id, username: user.username},
        process.env.JWT_SECRET,
        {expiresIn:"1d"}
    )

    res.cookie('token',token)
    res.status(200).json({
        message:'User loggedIn successfully',
        user:{
           id:user._id,
           username: user.username,
           email: user.email           
        }
    })
}

/**
 * @name logoutUserController
 * @description clear token form user cookie and add the token in blacklist
 * @access pulic  
 */

async function logoutUserController(req,res){
    const token = req.cookies.token

    if(token){
        await tokenBlacklistmodel.create({token})
    }
    res.clearCookie('token')

    res.status(200).json({
        message:"User logged out succesfully"
    })
}

/**
 * @name getMeController
 * @description get the current logged in user details,
 * @access private
 */

async function getMeController(req,res) {
    const user = await userModel.findById(req.user.id) //req.user.id comes form middleware
    res.status(200).json({
        message:'User details fetch successfully',
        user:{
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}

module.exports={
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController
}