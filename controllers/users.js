const fs = require('fs')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const { validationResult } = require('express-validator')
const HttpError = require('../models/http-error')
const User = require('../models/user')

const getUser = async (req, res, next) => {
    const userId = req.params.uid

    //const { id } = req.body
    let user 
    try{
        user = await User.findOne({ _id: userId }, '-password')
    } catch (err){
        const error = new HttpError('Failed to get user informations, please try again!', 500)
        return next(error)
    }
    res.json(user)
} // i want to fix this after authentication to only view the logged user

const signUp = async (req, res, next) => {
    const error = validationResult(req) 
    
    if(!error.isEmpty()) {
        return next(
            new HttpError('Invalid inputs, ', 422)
        )        
    }  //check if the data is valid first

    const {name, email, password} = req.body

    let existingUser

    try {
        existingUser = await User.findOne({ email })
    } catch (err) {
        const error = new HttpError('Failed to signUp, please try again!', 500)
        return next(error)
    }

    if(existingUser){
        const error = new HttpError('User already exist, please login!', 422)
        return next(error)
    }

    const salt = await bcrypt.genSalt()
    const hashedPassword = await bcrypt.hash(password, salt)
    //hashing the password using salt -- bcryptjs
    
    const createdUser = new User({
        name,
        email,
        password: hashedPassword,
        image: ''    
    })

    try {
        await createdUser.save()
    } catch (err){
        const error = new HttpError('Failed to create a new user, please try again!', 500)
        return next(error)
    }

    const token = jwt.sign({id: existingUser._id}, process.env.JWT_SECRET)


    res.status(201).json({user: createdUser.toObject({ getters: true}), token})
}

const login = async (req, res, next) => {
    const {email, password} = req.body

    let existingUser
    try {
        existingUser = await User.findOne({ email })
    } catch (err) {
        const error = new HttpError('Failed to Logging in, please try again!', 500)
        return next(error)
    }
    if( !existingUser ) {
        return next(new HttpError('Wrong credentials, Please try again!',401))
    }

    const isMatch = await bcrypt.compare(password, existingUser.password)
    
    if(!isMatch) {
        return next(new HttpError('Wrong credentials, Please try again!',401))
    }

    const token = jwt.sign({id: existingUser._id}, process.env.JWT_SECRET)

    res.json({message: 'Logged in', user: {id: existingUser._id}, token})
}

const updateUserInfo = async (req, res, next) => {
    const error = validationResult(req)
    
    if(!error.isEmpty()) {
        return next(
            new HttpError('Invalid inputs, ', 422)
        )        
    }  

    const {name, email} = req.body
    const userId = req.params.uid

    let user 

    try {
        user = await User.findById(userId)
    } catch (err) {
        const error = new HttpError('Something went wrong, could not Update user!', 500)
        return next(error)
    }

    user.name = name
    user.email = email

    try {
        await user.save()
    } catch (err) {
        const error = new HttpError('Something went wrong, could not Update user!', 500)
        return next(error)
    }


    res.status(200).json(user)

}// need to check for optimized update info

const updateUserImage = async (req, res, next) => {
    const userId = req.params.uid

    let user 

    try {
        user = await User.findById(userId)
    } catch (err) {
        const error = new HttpError('Something went wrong, could not Update user!', 500)
        return next(error)
    }
    const imagePath = user.image
    fs.unlink(imagePath, err => {
        console.log("old image wasn't deleted")
    })
    user.image = req.file.path

    try {
        await user.save()
    } catch (err) {
        const error = new HttpError('Something went wrong, could not Update user!', 500)
        return next(error)
    }


    res.status(200).json(user)
    console.log(req.file)
}

exports.getUser = getUser
exports.signUp = signUp
exports.login = login
exports.updateUserInfo = updateUserInfo
exports.updateUserImage = updateUserImage

