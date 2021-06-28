const { validationResult }= require('express-validator')
const mongoose = require('mongoose')

const HttpError = require('../models/http-error')
const Todo = require('../models/todo')
const User = require('../models/user')

const getTodoByID = async (req, res, next) =>{
    const todoId = req.params.tid

    let todo
    try {
        todo = await Todo.findById(todoId)
    } catch (err){
        const error = new HttpError('Failed to find a matching todo, please try again!', 500)
        return next(error)
    }


    if(!todo) {
        return next(
            new HttpError('Could not find a todo for the provided ID', 404)
        )        
    }
    res.json({todo: todo.toObject( {getters: true} )}) //Getters to tell mongoose to add an id property to the object without the underscore
}

const getTodosByUserID = async (req,res,next) => {
    const userId = req.params.uid 

    let todos
    try {
        todos= await Todo.find({ creator: userId})    
    } catch (err){
        const error = new HttpError('Failed to find a matching todo, please try again!', 500)
        return next(error)
    }
    if(!todos) {
        return next(
            new HttpError('Could not find a todo for the provided user', 404)
        )        
    }
    res.json(todos)
}

const createTodo = async (req, res, next) => {
    const error = validationResult(req) // comes with the check for express validator
    
    if(!error.isEmpty()) {
        return next(
            new HttpError('Invalid inputs, ', 422)
        )        
    }    

    const {title, isComplete, creator} = req.body
    const createdTodo = new Todo({
        title,
        isComplete,
        creator
    })

    try {
        await Todo.create(createdTodo)
    } catch (err){
        const error = new HttpError('Failed to create a new todo, please try again!', 500)
        return next(error)
    }
    res.status(201).json({todo: createdTodo})
}

const updateTodo = async (req, res, next) => {
    const error = validationResult(req) // comes with the check for express validator
    
    if(!error.isEmpty()) {
        return next(
            new HttpError('Invalid inputs, ', 422)
        )        
    }  

    const {isComplete } = req.body
    const todoId = req.params.tid

    let todo 
    try {
        todo = await Todo.findById(todoId)
    } catch (err) {
        const error = new HttpError('Something went wrong, could not Update todo!', 500)
        return next(error)
    }

    todo.isComplete = isComplete
    try {
        await todo.save()
    } catch (err) {
        const error = new HttpError('Something went wrong, could not Update todo!', 500)
        return next(error)
    }

    res.status(200).json(todo)

} // isn't there another way which is shorter to do this ? to update our data
//can we just add both of them to the try catch and make it only one try block ?

const deleteTodo = async (req, res, next) => {
    const todoId = req.params.tid
    
    try {
        await Todo.findOneAndRemove(todoId)

    } catch (err) {
        const error = new HttpError('Something went wrong, could not delete place',500)
        return next(error)
    }

    res.status(200).json({message: 'Deleted successfully'})
}

exports.getTodoByID = getTodoByID
exports.getTodosByUserID = getTodosByUserID
exports.createTodo = createTodo
exports.updateTodo = updateTodo
exports.deleteTodo = deleteTodo