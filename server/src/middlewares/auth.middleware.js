const jwt = require('jsonwebtoken')
const tokenBlacklistModel = require('../models/blacklist.model')

async function authUser(req,res,next){
    const token = req.cookies.token //It expects the JWT to be stored in a cookie named token

    if(!token){            //If no token is present, immediately reject the request with 401 Unauthorized.
        return res.status(401).json({
            message:'Token not provided.'
        })   
    }

    const isTokenBlacklisted = await tokenBlacklistModel.findOne({
        token
    })

    if(isTokenBlacklisted){
        return res.status(401).json({
            message:'Token is invalid'
        })
    }

    try{
        const decoded= jwt.verify(token, process.env.JWT_SECRET)//Checks the signature. It recomputes the signature using process.env.JWT_SECRET

        req.user=decoded

        next()
    }catch(err){
        return res.status(401).json({
            message:'Invalid token.'
        })
    }
    
}

module.exports={authUser}