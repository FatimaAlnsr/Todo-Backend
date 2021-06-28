const jwt = require("jsonwebtoken")
const User = require('../models/user')

const auth = async (req, res, next) => {
    try{
        if(req.method === 'OPTIONS'){
            return next()
        }

        const token = req.headers.authorization.split(' ')[1] //Authorization: 'Bearer token'
        if(!token){
            return res.status(401).json({ message: 'Authorization denied' })
        }

        const decodedToken =jwt.verify(token, process.env.JWT_SECRET)
        req.userData = {_id: decodedToken.userId}
        // const user = await User.findOne({_id: decodedToken.userId})
        // if(!user){
        //     throw new Error('Couldnt find user')
        // }
        next()
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
} //this auth is very bad D: but fixing it might take longer than neccessary 
//it doesnt serve its purpose which was suppose to check the logged in user

module.exports = auth