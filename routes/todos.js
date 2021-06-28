const express = require('express')
const { check } = require('express-validator')

const todoControllers = require('../controllers/todos')

const router = express.Router()



router.get('/:tid', todoControllers.getTodoByID) // find todo by to do id - not needed -

router.get('/user/:uid', todoControllers.getTodosByUserID) // find todo by user id 

router.post(
    '/',
    [
        check('title')
            .not()
            .isEmpty(),
        check('creator')
            .not()
            .isEmpty()
    ], 
    todoControllers.createTodo)
//check is a validator maybe better to validate it on the database?

router.patch('/:tid',
    [
    check('isComplete')
        .not()
        .isEmpty()
    ],
    todoControllers.updateTodo)

router.delete('/:tid', todoControllers.deleteTodo)

module.exports = router


// router.get('/:tid', todoControllers.getTodoByID) 

// router.get('/user/:uid', todoControllers.getTodosByUserID) 

// router.post('/',todoControllers.createTodo)

// router.patch('/:tid',todoControllers.updateTodo)

// router.delete('/:tid', todoControllers.deleteTodo)

