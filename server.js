const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors')
const dotenv = require('dotenv').config()
const cookieParser = require("cookie-parser")
const userRoute = require('./routes/userRoute')
const errorHandler = require('./middlewares/errorMiddleware')

const app = express()

//Middlewares
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())

//Routers Middlewares
app.use('/api/users', userRoute)

//Routes
app.get('/', (req, res) => {
    res.send('Home Page')
})

//Error Middlewares
app.use(errorHandler)

//Connect to DB and start server
const PORT = process.env.PORT || 3000
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Serwer działa na porcie: ${PORT}`);
        })
    })
    .catch(err => console.log(err))