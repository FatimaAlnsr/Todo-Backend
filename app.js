const fs = require('fs')
const path = require('path')

const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const cors = require('cors')

const HttpError = require('./models/http-error')
const todoRoutes = require('./routes/todos')
const userRoutes = require('./routes/users')

require('dotenv').config()

const app = express()

app.use(cors())

app.use(bodyParser.json())

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use('/api/todos',todoRoutes)  // => /api/todos/... our API should look like this
app.use('/api/users', userRoutes)

app.use((req,res, next) => {
    const error = new HttpError('Error: Not Found', 404)
    return next(error)
}) //dont feel like i really need it - should review this block later
//its an error handling for unsupported routes

app.use((error, req, res, next) => {
    if(req.file){
        fs.unlink(req.file.path, err => {
            console.log(err)
        })
    } //if an error happened while there is file upload it will be deleted
    if(res.headerSent) {
        return next(error)
    }
    res.status(error.code || 500)
    res.json({message: error.message || 'An Unknown error occured!'})
}) //default error handling middlewar

mongoose
    .connect(process.env.MONGO_DB_CONNECTION,{
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
    })
    .then(()=>{
        app.listen(process.env.PORT || 5000)
    })
    .catch(err => {
        console.log(err)
    })

